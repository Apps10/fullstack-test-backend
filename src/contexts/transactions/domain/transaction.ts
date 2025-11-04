export interface CustomerToApiJSON extends PrimitiveTransaction {}
export interface CustomerToJSON extends PrimitiveTransaction {}

export enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface PrimitiveTransaccionMetadata {
  description: string
}
export interface PrimitiveTransaction  {
  id?: string
  orderId: string
  payerTransactionId?: string
  payerName: string
  totalAmount: number
  baseFee: number
  taxFee: number  
  description?: string
  paymentStatus: TransactionStatus
}


export class Transaction {
  public readonly id: string
  public readonly orderId: string
  public readonly payerName: string
  public readonly payerTransactionId: string
  public readonly baseFee: number
  public readonly taxFee: number  
  public readonly totalAmount: number
  public readonly description?: string
  // public readonly deliveryFee: number
  public readonly paymentStatus: TransactionStatus
  
  constructor({
    id,
    totalAmount,
    baseFee,
    payerName,
    paymentStatus,
    orderId,
    payerTransactionId,
    description,
    taxFee
  }: PrimitiveTransaction){
    this.id = id
    this.baseFee = baseFee
    this.taxFee = taxFee
    this.totalAmount = totalAmount
    this.payerName = payerName,
    this.description = description
    this.payerTransactionId = payerTransactionId
    this.paymentStatus = paymentStatus
    this.orderId = orderId
  }
}