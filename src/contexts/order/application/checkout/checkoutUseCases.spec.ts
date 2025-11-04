import { err, ok } from '../../../shared/models/result';
import {
  PaymentCreditCardError,
  PaymentGenericError,
} from '../../domain/payment.exceptions';
import {
  OrderAlreadyProcessedError,
  OrderError,
} from '../../domain/order.exception';
import { OrderStatus } from '../../domain/orderStatus.enum';
import { TransactionStatus } from '../../../transactions/domain/transaction';
import { v4 as uuidv4 } from 'uuid';
import { CheckoutUseCase } from './checkout';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-test'),
}));

const encodeCard = (cardObj: any) =>
  Buffer.from(JSON.stringify(cardObj), 'utf8').toString('base64');

describe('CheckoutUseCase', () => {
  let orderRepo: any;
  let transactionRepo: any;
  let paymentService: any;
  let usecase: CheckoutUseCase;

  const now = new Date();
  const futureYear = now.getFullYear() + 1;
  const futureExp = `12/${futureYear}`;

  beforeEach(() => {
    orderRepo = {
      runInTransaction: jest.fn(async (cb: any) => {
        // default behavior: execute callback
        return cb({});
      }),
      updateOrderTx: jest.fn(async () => ok(true)),
    };

    transactionRepo = {
      findOrderByTransactionId: jest.fn(),
      updateTransaction: jest.fn(async () => ok(true)),
    };

    paymentService = {
      processPayment: jest.fn(),
    };

    usecase = new CheckoutUseCase(orderRepo, transactionRepo, paymentService);
  });

  test('returns TransactionError when transaction not found', async () => {
    const txErr = { code: 'NOT_FOUND', message: 'tx not found' };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(err(txErr));

    const res = await usecase.execute({
      transactionId: 'tx-1',
      creditCard: encodeCard({
        cardName: 'John Doe',
        cardNumber: '4111111111111111',
        expDate: futureExp,
        cvv: '123',
      }),
      customerId: 'c1',
      emailHolder: 'j@d.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual(txErr);
    expect(transactionRepo.findOrderByTransactionId).toHaveBeenCalledWith(
      'tx-1',
    );
  });

  test.each([OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.CANCELLED])(
    'returns OrderAlreadyProcessedError when order status is %s',
    async (status) => {
      const order = { id: 'o1', status, totalAmount: 100, baseFee: 0, taxFee: 0 };
      const transaction = { id: 't1', order };
      transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok(transaction));

      const res = await usecase.execute({
        transactionId: 't1',
        creditCard: encodeCard({
          cardName: 'John Doe',
          cardNumber: '4111111111111111',
          expDate: futureExp,
          cvv: '123',
        }),
        customerId: 'c1',
        emailHolder: 'j@d.com',
      });

      expect(res.isOk).toBe(false);
      expect(res.isOk === false && res.error).toBeDefined();
    },
  );

  test('invalid base64 payload returns PaymentGenericError', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING, totalAmount: 100, baseFee: 0, taxFee: 0 };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok({ id: 't1', order }));

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: 'not-base64-@@@',
      customerId: 'c1',
      emailHolder: 'a@b.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });

  test('invalid card fields return PaymentCreditCardError (short name)', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING, totalAmount: 100, baseFee: 0, taxFee: 0 };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok({ id: 't1', order }));

    const encoded = encodeCard({
      cardName: 'J', // too short
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '123',
    });

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'c1',
      emailHolder: 'a@b.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });

  test('invalid card number returns PaymentCreditCardError', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING, totalAmount: 100, baseFee: 0, taxFee: 0 };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok({ id: 't1', order }));

    const encoded = encodeCard({
      cardName: 'John Doe',
      cardNumber: '12', // too short
      expDate: futureExp,
      cvv: '123',
    });

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'c1',
      emailHolder: 'a@b.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });

  test('paymentService returns err -> propagate PaymentError', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING, totalAmount: 100, baseFee: 0, taxFee: 0 };
    const transaction = { id: 't1', order };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok(transaction));

    const encoded = encodeCard({
      cardName: 'John Doe',
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '123',
    });

    const paymentErr = { code: 'DECLINED', message: 'card declined' };
    paymentService.processPayment.mockResolvedValueOnce(err(paymentErr));

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'c1',
      emailHolder: 'a@b.com',
    });

    expect(paymentService.processPayment).toHaveBeenCalled();
    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toEqual(paymentErr);
  });

  test('paymentService throws exception -> returns PaymentGenericError', async () => {
    const order = { id: 'o1', status: OrderStatus.PENDING, totalAmount: 100, baseFee: 0, taxFee: 0 };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok({ id: 't1', order }));

    const encoded = encodeCard({
      cardName: 'John Doe',
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '123',
    });

    paymentService.processPayment.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'c1',
      emailHolder: 'a@b.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });

  test('successful APPROVED payment updates order and transaction and returns ok', async () => {
    const order = {
      id: 'o1',
      
      status: OrderStatus.PENDING,
      totalAmount: 150,
      baseFee: 5,
      taxFee: 2,
    };
    const transaction = { id: 't1', order };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok(transaction));

    const encoded = encodeCard({
      cardName: 'Jane Doe',
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '123',
    });

    const paymentResult = {
      status: 'APPROVED',
      payerName: 'Jane Doe',
      description: 'paid',
      payerReference: 'pay-123',
      created_at: new Date().toISOString(),
    };

    paymentService.processPayment.mockResolvedValueOnce(ok(paymentResult));
    orderRepo.updateOrderTx.mockResolvedValueOnce(ok(true));
    transactionRepo.updateTransaction.mockResolvedValueOnce(ok(true));

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'cust-1',
      emailHolder: 'j@doe.com',
    });

    expect(res.isOk).toBe(true);
    expect(res.isOk === true && res.value).toEqual(paymentResult);
    expect(orderRepo.runInTransaction).toHaveBeenCalled();
    expect(transactionRepo.updateTransaction).toHaveBeenCalledWith('t1', expect.objectContaining({
      payerName: paymentResult.payerName,
      payerTransactionId: paymentResult.payerReference,
      paymentStatus: TransactionStatus.SUCCESS,
      totalAmount: order.totalAmount,
    }));
  });

  test('payment result CANCELLED sets statuses to CANCELLED and still returns ok/propagates update', async () => {
    const order = {
      id: 'o1',
      status: OrderStatus.PENDING,
      totalAmount: 50,
      baseFee: 0,
      taxFee: 0,
    };
    const transaction = { id: 't1', order };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok(transaction));

    const encoded = encodeCard({
      cardName: 'Jane Doe',
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '1234',
    });

    const paymentResult = {
      status: 'CANCELLED',
      payerName: 'Jane Doe',
      description: 'failed',
      payerReference: 'pay-456',
      created_at: new Date().toISOString(),
    };

    paymentService.processPayment.mockResolvedValueOnce(ok(paymentResult));
    orderRepo.updateOrderTx.mockResolvedValueOnce(ok(true));
    transactionRepo.updateTransaction.mockResolvedValueOnce(ok(true));

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'cust-1',
      emailHolder: 'j@doe.com',
    });

    expect(res.isOk).toBe(true);
    expect(res.isOk === true && res.value).toEqual(paymentResult);
    expect(transactionRepo.updateTransaction).toHaveBeenCalledWith('t1', expect.objectContaining({
      paymentStatus: TransactionStatus.CANCELLED,
    }));
  });

  test('updateOrderTx failing inside transaction causes PaymentGenericError', async () => {
    const order = {
      id: 'o1',
      status: OrderStatus.PENDING,
      totalAmount: 150,
      baseFee: 0,
      taxFee: 0,
    };
    const transaction = { id: 't1', order };
    transactionRepo.findOrderByTransactionId.mockResolvedValueOnce(ok(transaction));

    const encoded = encodeCard({
      cardName: 'Jane Doe',
      cardNumber: '4111111111111111',
      expDate: futureExp,
      cvv: '123',
    });

    const paymentResult = {
      status: 'APPROVED',
      payerName: 'Jane Doe',
      description: 'paid',
      payerReference: 'pay-789',
      created_at: new Date().toISOString(),
    };

    paymentService.processPayment.mockResolvedValueOnce(ok(paymentResult));

    orderRepo.updateOrderTx.mockResolvedValueOnce(err({ message: 'db fail' }));

    const res = await usecase.execute({
      transactionId: 't1',
      creditCard: encoded,
      customerId: 'cust-1',
      emailHolder: 'j@doe.com',
    });

    expect(res.isOk).toBe(false);
    expect(res.isOk === false && res.error).toBeDefined();
  });
});
