export interface CustomerToApiJSON extends PrimitiveTransaction {}
export interface CustomerToJSON extends PrimitiveTransaction {}

export enum TransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface PrimitiveTransaction  {
  id?: string
  orderId: string
  // transactionReference: string
  payerName: string
  payerTransactionId?: string
  totalAmount: number
  // baseFee: number
  // deliveryFee: number
  paymentStatus: TransactionStatus
}


export class Transaction {
  public readonly id: string
  public readonly orderId: string
  // // public readonly transactionReference: string
  public readonly payerName: string
  public readonly payerTransactionId?: string
  public readonly totalAmount: number
  // public readonly baseFee: number
  // public readonly deliveryFee: number
  public readonly paymentStatus: TransactionStatus
  
  constructor({
    id,
    totalAmount,
    // baseFee,
    // deliveryFee,
    payerName,
    // product_id,
    paymentStatus,
    // transactionReference,
    orderId,
    payerTransactionId,
  }: Transaction){
    this.id = id
    this.totalAmount = totalAmount
    // this.baseFee = baseFee
    // this.deliveryFee = deliveryFee
    this.payerName = payerName
    // this.phone = phone
    // this.product_id = product_id
    // this.status = status
    // this.transactionReference = transactionReference
    this.payerTransactionId = payerTransactionId
    this.paymentStatus = paymentStatus
    this.orderId = orderId
  }

}