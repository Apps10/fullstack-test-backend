import { OrderStatus } from "../../../../generated/prisma/enums";
import { PrimitiveOrderItem } from "./orderItem";

export interface CreateOrder {
    paidAt?:        Date
   
    customerId:     string
    status:         OrderStatus
  
    totalAmount:    number
    orderItem:      PrimitiveOrderItem[]
} 