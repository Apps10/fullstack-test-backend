export interface PrimitivePaymentMethod {
  id?: string;
  customerId: string;
  payerProvider: string;
  paymentTokenCard: string;
}

export class PaymentMethod {
  public readonly id?: string;
  public readonly customerId: string;
  public readonly payerProvider: string;
  public readonly paymentTokenCard: string;

  constructor({
    customerId,
    payerProvider,
    paymentTokenCard,
    id,
  }: PrimitivePaymentMethod) {
    this.id = id,
    this.customerId = customerId,
    this.payerProvider = payerProvider,
    this.paymentTokenCard = paymentTokenCard
  }
}
