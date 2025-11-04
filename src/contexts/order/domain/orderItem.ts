import { Order } from "./order"

export interface PrimitiveOrderItem {
  id?: string  
  productId: number,
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface OrderItemToApiJSON extends PrimitiveOrderItem {}

export class OrderItem {
  private readonly id: string              
  private readonly productId: number;
  private readonly quantity: number
  private readonly unitPrice: number
  private readonly lineTotal: number
  
  constructor({
    id,
    unitPrice,
    lineTotal,
    productId,
    quantity
  }: PrimitiveOrderItem) {
    this.id=id
    this.unitPrice=unitPrice
    this.lineTotal=lineTotal
    this.productId=productId
    this.quantity = quantity
  }
  
  toApiJSON() : OrderItemToApiJSON{
    return {
      id: this.id,
      unitPrice: this.unitPrice,
      lineTotal: this.lineTotal,
      productId: this.productId,
      quantity: this.quantity
    }
  }

  static convertArrayPrimitiveToArrayInstances(orderItems: PrimitiveOrderItem[]): OrderItem[] {
    return orderItems.map(oi=> new OrderItem({...oi}))
  }



  
}