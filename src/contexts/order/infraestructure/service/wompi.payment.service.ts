import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import {
  UAT_SANDBOX_INTEGRITY_KEY,
  UAT_SANDBOX_PRIVATE_KEY,
  UAT_SANDBOX_PUBLIC_KEY,
  UAT_SANDBOX_URL,
} from '../../../shared/config/envs';
import {
  PaymentService,
  ProcessPaymentMethod,
  ProcessPaymentMethodResult,
} from '../../domain/paymentService';
import { err, ok, Result } from '../../../shared/models/result';
import { MerchantResponse } from '../interfaces/wompi.merchant.interface';
import { CardTokenResponse } from '../interfaces/wompi.card.interface';
import {
  PaymentCreditCardError,
  PaymentError,
} from '../../domain/payment.exceptions';
import { PaymentTransactionResponse } from '../interfaces/wompi.paymentTransaction.interface';
import { GetTransactionResponse } from '../interfaces/wompi.getTransaction.interface';

@Injectable()
export class WompiPaymentService implements PaymentService {
  private readonly axiosInstance;
  private readonly logger = new Logger('WompiPaymentService');
  private readonly PAYER_NAME = "WOMPI"
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: UAT_SANDBOX_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async processPayment(
    processPaymentDto: ProcessPaymentMethod,
  ): Promise<Result<ProcessPaymentMethodResult, PaymentError>> {
    const { totalAmount, creditCard, orderId, customerId, emailHolder,transactionId, basefee, taxfee } =
      processPaymentDto;
    let processPaymentMethodResult:ProcessPaymentMethodResult = {
      orderId,
      payerName: this.PAYER_NAME,
      totalAmount,
      currency: 'COP',
      status:"DENIED",
      created_at: new Date().toJSON(),
      payerReference: null,
      description: null,
      id: transactionId,
      basefee,
      taxfee
    }
    try {
      const { presigned_acceptance, presigned_personal_data_auth } =
        await this.getAcceptationToken();
      if (!presigned_acceptance || !presigned_personal_data_auth) {
        return err(PaymentCreditCardError());
      }

      const cardPayerData = await this.getCardToken(creditCard);
      if (!cardPayerData) {
        processPaymentMethodResult.description = "error with the payment Method"
        return ok(processPaymentMethodResult);
      }

      const acceptance_token = presigned_acceptance?.acceptance_token;
      const accept_personal_auth =
        presigned_personal_data_auth?.acceptance_token;
      const paymentSource = await this.createCardPaymentMethod({
        cardToken: cardPayerData.id,
        emailHolder,
        accept_personal_auth,
        acceptance_token,
      });
      if (!paymentSource) {
        processPaymentMethodResult.description = "error with the payment Method"
      }

      const payTransaction = await this.payWithCreditCard({
        totalAmount,
        emailHolder,
        orderId,
        paymentSourceId: paymentSource.id,
      });
      if (!payTransaction) {
        processPaymentMethodResult.description = "error with the payment Method"
        return err(PaymentCreditCardError());
      }
      processPaymentMethodResult.payerReference = payTransaction.id

      /**
       * se hace de esta manera debido a que la cuenta que sandbox ya tiene configurado un webhook,
       * lo ideal es que se cree la transaccion y luego desde el webhook es que se cambia el estado
       * se agrego un tiempo de espera porque en ocaciones se demora el procesar el pago.
       */
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(2000);

      const transactionSearched = await this.searchTransaction(
        payTransaction.id,
      );
      const { created_at, id, status, reference } = transactionSearched;

      processPaymentMethodResult.created_at = created_at
      processPaymentMethodResult.payerReference = reference
      processPaymentMethodResult.status = status
      return ok(processPaymentMethodResult);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async getAcceptationToken() {
    try {
      const result = (
        await this.axiosInstance.get(`/merchants/${UAT_SANDBOX_PUBLIC_KEY}`)
      ).data as MerchantResponse;
      return {
        presigned_acceptance: result.data.presigned_acceptance,
        presigned_personal_data_auth: result.data.presigned_personal_data_auth,
      };
    } catch (e) {}
  }

  private async getCardToken(creditCard: ProcessPaymentMethod['creditCard']) {
    try {
      const cardToken = (
        await this.axiosInstance.post('/tokens/cards', creditCard, {
          headers: {
            Authorization: 'Bearer ' + UAT_SANDBOX_PUBLIC_KEY,
          },
        })
      ).data as CardTokenResponse;
      return cardToken.data;
    } catch (e) {
      this.logger.fatal(e)
    }
  }

  private async createCardPaymentMethod({
    cardToken,
    emailHolder,
    accept_personal_auth,
    acceptance_token,
  }: {
    cardToken: string;
    emailHolder: string;
    acceptance_token: string;
    accept_personal_auth: string;
  }) {
    try {
      const payloadPayment = {
        type: 'CARD',
        token: cardToken,
        customer_email: emailHolder,
        acceptance_token,
        accept_personal_auth,
      };
      const res = (
        await this.axiosInstance.post('/payment_sources', payloadPayment, {
          headers: {
            Authorization: 'Bearer ' + UAT_SANDBOX_PRIVATE_KEY,
          },
        })
      ).data as CardTokenResponse;

      return res.data;
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async payWithCreditCard({
    totalAmount,
    emailHolder,
    orderId,
    paymentSourceId,
  }: {
    paymentSourceId: string;
    totalAmount: number;
    emailHolder: string;
    orderId: string;
  }) {
    try {
      const reference = `order-${orderId}-${Date.now()}`; // e.j. order-1234-1700000000000

      const totalAmountInCents = totalAmount * 100;
      const signatureInput = `${reference}${totalAmountInCents}COP${UAT_SANDBOX_INTEGRITY_KEY}`;
      const signature = sha256(signatureInput); // js-sha256 devuelve hex lowercase

      const payloadTransaccion = {
        amount_in_cents: totalAmountInCents,
        currency: 'COP',
        signature,
        customer_email: emailHolder,
        payment_method: {
          installments: 1, // Número de cuotas si la fuente de pago representa una tarjeta de lo contrario el campo payment_method puede ser ignorado.
        },
        reference, // Referencia única de pago
        payment_source_id: paymentSourceId, // ID de la fuente de pago
      };

      const transaccion = (
        await this.axiosInstance.post('/transactions', payloadTransaccion, {
          headers: {
            Authorization: 'Bearer ' + UAT_SANDBOX_PRIVATE_KEY,
          },
        })
      ).data as PaymentTransactionResponse;

      return transaccion.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  private async searchTransaction(transactionId: string) {
    const searchTransaccion = (
      await this.axiosInstance.get(`/transactions/${transactionId}`)
    ).data as GetTransactionResponse;

    return searchTransaccion.data;
  }
}
