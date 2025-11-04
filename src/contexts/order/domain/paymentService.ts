import { Result } from '../../shared/models/result';
import { PaymentError } from './payment.exceptions';

export interface ProcessPaymentMethod {
  totalAmount: number;
  basefee: number;
  taxfee: number;
  orderId: string;
  emailHolder: string;
  customerId: string;
  creditCard: PaymentMethodCard;
  transactionId: string
}

export interface PaymentMethodCard {
  number: string;
  exp_month: string;
  exp_year: string;
  cvc: string;
  card_holder: string;
}

export class ProcessPaymentMethodResult {
  totalAmount: number;
  basefee: number;
  taxfee: number;
  created_at: string;
  currency: string;
  status: "APPROVED" | "DENIED"
  id: string
  orderId: string;
  payerName: string
  payerReference: string
  description: string
}



export abstract class PaymentService {
  abstract processPayment(
    processPaymentDto: ProcessPaymentMethod,
  ): Promise<Result<ProcessPaymentMethodResult, PaymentError>>;
}
