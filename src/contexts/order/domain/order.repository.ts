import { Result } from '../../shared/models/result';
import { PrimitiveOrder } from './order';
import { OrderError } from './order.exception';

export abstract class OrderRepository {
  abstract updateOrder(
    updateOrderStatusDto: PrimitiveOrder,
  ): Promise<Result<{ orderId: string }, OrderError>>;
  abstract findByIdIfIsProccesed(
    id: string,
  ): Promise<Result<null | { id: string; transactionId: string }, OrderError>>;

  abstract markCancelled(orderId: string): Promise<Result<null, any>>;
  abstract runInTransaction?<T>(fn: (tx: any) => Promise<T>): Promise<T>;

  abstract createOrder(
    payload: PrimitiveOrder,
    tx?: any,
  ): Promise<Result<{ orderId: string }, OrderError>>;
}
