import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  OrderAlreadyProcessedError,
  OrderError,
} from '../../domain/order.exception';
import { err, ok, Result } from '../../../shared/models/result';
import { OrderRepository } from '../../domain/order.repository';
import { OrderStatus } from '../../domain/orderStatus.enum';
import { TransactionRepository } from '../../../transactions/domain/transaction.repository';
import { CheckOutDto, DecryptedCreditCard } from './checkout.dto';
import {
  PaymentMethodCard,
  PaymentService,
  ProcessPaymentMethodResult,
} from '../../domain/paymentService';
import {
  PaymentCreditCardError,
  PaymentError,
  PaymentGenericError,
} from '../../domain/payment.exceptions';
import { TransactionError } from '../../../transactions/domain/transactionException';
import {
  PrimitiveTransaction,
  Transaction,
  TransactionStatus,
} from '../../../transactions/domain/transaction';

export class CheckoutUseCase {
  private readonly logger = new Logger(CheckoutUseCase.name);

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly paymentService: PaymentService,
  ) {}

  async execute({
    creditCard: encodedCreditCard,
    customerId,
    emailHolder,
    transactionId,
  }: CheckOutDto): Promise<
    Result<
      ProcessPaymentMethodResult,
      TransactionError | PaymentError | OrderError
    >
  > {
    const transactionRes =
      await this.transactionRepo.findOrderByTransactionId(transactionId);
    if (transactionRes.isOk === false) {
      this.logger.warn(`Transaction not found`, { transactionId });
      return err(transactionRes.error);
    }

    const transaction = transactionRes.value;
    const order = transaction.order;

    if (
      [OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.CANCELLED].includes(
        order.status,
      )
    ) {
      this.logger.warn('Order already processed', { orderId: order.id });
      return err(OrderAlreadyProcessedError());
    }

    const creditCardValidation = this.validateCreditCard(encodedCreditCard);
    if (creditCardValidation.isOk === false) {
      this.logger.warn('Invalid credit card data', {
        transactionId,
        error: creditCardValidation.error,
      });
      return err(creditCardValidation.error);
    }

    const creditCard = creditCardValidation.value;

    const paymentProcessRes = await this.processPayment({
      creditCard,
      customerId,
      emailHolder,
      orderId: order.id,
      totalAmount: order.totalAmount,
      transactionId:transaction.id,
      basefee: order.baseFee,
      taxfee: order.taxFee
    });

    if (paymentProcessRes.isOk === false) {
      return err(paymentProcessRes.error);
    }

    const paymentResult = paymentProcessRes.value as ProcessPaymentMethodResult;

    const updateRes = await this.updateOrderAndTransaction(
      order.id,
      transaction.id,
      customerId,
      order.totalAmount,
      paymentResult,
    );

    if (updateRes.isOk === false) {
      return err(updateRes.error);
    }

    return ok(paymentResult);
  }

  private validateCreditCard(
    encodedCard: string,
  ): Result<PaymentMethodCard, PaymentError> {
    try {
      const decoded = safeBase64Decode(encodedCard);
      const parsed = JSON.parse(decoded);

      if (
        !parsed ||
        typeof parsed.cardName !== 'string' ||
        typeof parsed.cardNumber !== 'string' ||
        typeof parsed.expDate !== 'string' ||
        typeof parsed.cvv !== 'string'
      ) {
        return err(PaymentGenericError('credit card payload invalid'));
      }

      const card = parsed as DecryptedCreditCard;

      if (card.cardName.trim().length < 2)
        return err(PaymentCreditCardError('Invalid card holder name'));
      if (!isValidCardNumber(card.cardNumber))
        return err(PaymentCreditCardError('Invalid card number'));
      if (!isValidExpDate(card.expDate))
        return err(PaymentCreditCardError('Invalid expiration date'));
      if (!isValidCvv(card.cvv))
        return err(PaymentCreditCardError('Invalid CVV'));

      const [mm, yyRaw] = card.expDate.split('/');
      const creditCard: PaymentMethodCard = {
        card_holder: card.cardName,
        cvc: card.cvv,
        exp_month: mm.padStart(2, '0'),
        exp_year: yyRaw,
        number: card.cardNumber.replace(/\s+/g, ''),
      };

      return ok(creditCard);
    } catch (e) {
      return err(PaymentGenericError('credit card payload invalid'));
    }
  }

  private async processPayment({
    creditCard,
    customerId,
    emailHolder,
    orderId,
    totalAmount,
    transactionId,
    basefee,
    taxfee,
  }: {
    creditCard: PaymentMethodCard;
    customerId: string;
    emailHolder: string;
    orderId: string;
    totalAmount: number;
    transactionId: string;
    basefee: number;
    taxfee: number;
  }): Promise<Result<ProcessPaymentMethodResult, PaymentError>> {
    try {
      const res = await this.paymentService.processPayment({
        creditCard,
        customerId,
        emailHolder,
        orderId,
        totalAmount,
        transactionId,
        basefee,
        taxfee,
      });

      if (res.isOk == false) {
        this.logger.warn('Payment service returned error', res.error);
        return err(res.error);
      }

      return ok(res.value);
    } catch (e) {
      this.logger.error('PaymentService threw an exception', e);
      return err(PaymentGenericError('Error procesando el pago'));
    }
  }

  private async updateOrderAndTransaction(
    orderId: string,
    transactionId: string,
    customerId: string,
    totalAmount: number,
    paymentResult: ProcessPaymentMethodResult,
  ): Promise<Result<true, PaymentError>> {
    const newOrderStatus =
      paymentResult.status === 'APPROVED'
        ? OrderStatus.PAID
        : OrderStatus.CANCELLED;
    const newTransactionStatus =
      paymentResult.status === 'APPROVED'
        ? TransactionStatus.SUCCESS
        : TransactionStatus.CANCELLED;

    try {
      await this.orderRepo.runInTransaction(async (tx) => {
        const updateOrderRes = await this.orderRepo.updateOrderTx(
          orderId,
          {
            status: newOrderStatus,
            paidAt: new Date(paymentResult.created_at),
          },
          tx,
        );

        if (!updateOrderRes.isOk) {
          this.logger.error('Failed updating order status', {
            orderId,
            newOrderStatus,
          });
          throw PaymentCreditCardError(
            'Could not update the order status, try again',
          );
        }

        await this.transactionRepo.updateTransaction(transactionId, {
          payerName: paymentResult.payerName,
          description: paymentResult.description,
          payerTransactionId: paymentResult.payerReference,
          paymentStatus: newTransactionStatus as TransactionStatus,

          totalAmount,
        });
      });

      return ok(true);
    } catch (error) {
      this.logger.error('Transaction rollback due to error', error);
      return err(PaymentGenericError('Could not update order or transaction'));
    }
  }
}

const safeBase64Decode = (b64: string): string => {
  if (typeof Buffer !== 'undefined' && (Buffer as any).from) {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  return atob(b64);
};

const isValidCardNumber = (num: string): boolean => {
  const digits = num.replace(/\D/g, '');
  return digits.length >= 12 && digits.length <= 19;
};

const isValidExpDate = (exp: string): boolean => {
  const m = exp.match(/^(\d{2})\/(\d{2,4})$/);
  if (!m) return false;
  const [_, mm, yy] = m;
  const month = Number(mm);
  const year = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  return (
    month >= 1 &&
    month <= 12 &&
    expDate >= new Date(now.getFullYear(), now.getMonth(), 1)
  );
};

const isValidCvv = (cvv: string): boolean => {
  const d = cvv.replace(/\D/g, '');
  return d.length === 3 || d.length === 4;
};
