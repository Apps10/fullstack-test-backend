import { OrderItem, PrimitiveOrderItem } from "./orderItem"
import { OrderStatus } from "./orderStatus.enum"

export interface PrimitiveOrder{
  id?:            string             
  paidAt?:        Date
 
  customerId:     string
  status:         OrderStatus

  baseFee:        number
  taxFee:         number 
  totalAmount:    number
  orderItem:      PrimitiveOrderItem[]
  createdAt?:     Date,      
  updatedAt?:     Date,   
}


export class Order {
  public readonly id: string             
  public readonly totalAmount: number
  public readonly status: OrderStatus
  public readonly baseFee: number
  public readonly taxFee: number  
  public readonly paidAt: Date
  public readonly orderItem: OrderItem[]
  public readonly createdAt: Date      
  public readonly updatedAt: Date   

  constructor({
    id,
    totalAmount,
    status,
    paidAt,
    orderItem,
    createdAt,
    updatedAt,
    baseFee,
    taxFee
  }: PrimitiveOrder){
    this.id = id,
    this.totalAmount = totalAmount,
    this.status = status,
    this.paidAt = paidAt,
    this.orderItem = OrderItem.convertArrayPrimitiveToArrayInstances(orderItem),
    this.createdAt = createdAt,
    this.updatedAt = updatedAt
    this.baseFee = baseFee
    this.taxFee = taxFee
  }

  toApiJSON(){
    return {
      id: this.id,
      totalAmount: this.totalAmount,
      status: this.status,
      paidAt: this.paidAt,
      orderItem: this.orderItem,
    }
  }

  toJSON(){
    return {
      id: this.id,
      totalAmount: this.totalAmount,
      status: this.status,
      paidAt: this.paidAt,
      orderItem: this.orderItem,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt 
    }
  }
}