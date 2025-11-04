import { InventoryError } from '../../inventory/domain/inventory.exceptions';

export type OrderError =
  | {
      kind: 'order';
      message: string;
      statusCode: number;
    }
  | InventoryError;

export const OrderNotFoundError = (messageError?: string): OrderError => ({
  kind: 'order',
  message: messageError ?? 'Order Not Found',
  statusCode: 404,
});

export const OrderShouldHaveItemsError = (
  messageError?: string,
): OrderError => ({
  kind: 'order',
  message: messageError ?? 'The order must have at least one item',
  statusCode: 400,
});

export const OrderAlreadyProcessedError = (
  messageError?: string,
): OrderError => ({
  kind: 'order',
  message: messageError ?? 'The order already processed',
  statusCode: 400,
});


export const OrderGenericError = (
  messageError?: string,
): OrderError => ({
  kind: 'order',
  message: messageError ?? 'The order has an error',
  statusCode: 400,
});
