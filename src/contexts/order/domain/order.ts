import { OrderItem, PrimitiveOrderItem } from "./orderItem"
import { OrderStatus } from "./orderStatus.enum"

export interface PrimitiveOrder{
  id?:            string             
  paidAt?:        Date
 
  customerId:     string
  status:         OrderStatus

  totalAmount:    number
  orderItem:      PrimitiveOrderItem[]
  createdAt?:     Date,      
  updatedAt?:     Date,   
}


export class Order {
  private readonly id: string             
  private readonly totalAmount: number
  private readonly status: OrderStatus
  private readonly paidAt: Date
  private readonly orderItem: OrderItem[]
  private readonly createdAt: Date      
  private readonly updatedAt: Date   

  constructor({
    id,
    totalAmount,
    status,
    paidAt,
    orderItem,
    createdAt,
    updatedAt
  }: Order){
    this.id = id,
    this.totalAmount = totalAmount,
    this.status = status,
    this.paidAt = paidAt,
    this.orderItem = orderItem,
    this.createdAt = createdAt,
    this.updatedAt = updatedAt
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