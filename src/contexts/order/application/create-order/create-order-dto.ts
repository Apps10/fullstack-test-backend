import { PrimitiveOrderItem } from "../../domain/orderItem";

export class DeliveryDto {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export class CreateOrderDto {
  customerId?: string;
  orderId?: string;
  delivery: DeliveryDto;
  orderItems: PrimitiveOrderItem[];
}