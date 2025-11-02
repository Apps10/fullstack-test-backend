export type CustomerError = {
  kind: 'customer';
  message: string;
  statusCode?: number;
};

export const CustomerNotFoundError = (messageError?: string): CustomerError => ({
  kind: 'customer',
  message: messageError ?? "Customer Not Found",
  statusCode: 404,
});

export const CustomerAlreadyExistError = (messageError?: string): CustomerError => ({
  kind: 'customer',
  message: messageError ?? "User Already Register",
  statusCode: 400,
});

export const CustomerAlreadyProcessedError = (messageError?: string): CustomerError => ({
  kind: 'customer',
  message: messageError ?? 'The order already processed',
  statusCode: 400,
});