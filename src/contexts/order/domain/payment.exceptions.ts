import { InventoryError } from '../../inventory/domain/inventory.exceptions';

export type PaymentError =
  | {
      kind: 'payment';
      message: string;
      statusCode: number;
    }
  | InventoryError;

export const PaymentNotFoundError = (messageError?: string): PaymentError => ({
  kind: 'payment',
  message: messageError ?? 'payment Not Found',
  statusCode: 404,
});



export const PaymentCreditCardError = (
  messageError?: string,
): PaymentError => ({
  kind: 'payment',
  message: messageError ?? 'We had problems with your paymethod, try again',
  statusCode: 402,
});



export const PaymentGenericError = (
  messageError?: string,
): PaymentError => ({
  kind: 'payment',
  message: messageError ?? 'The payment already processed',
  statusCode: 402,
});
