
export enum OrderStatus {
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
  PENDING = 'PENDING',
  PAID = 'PAID'
}

export const OrderStatusList = [
  OrderStatus.CANCELLED,
  OrderStatus.DELIVERED,
  OrderStatus.PENDING
]