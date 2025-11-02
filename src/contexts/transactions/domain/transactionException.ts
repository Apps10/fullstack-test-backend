
export type TransactionError = {
  kind: 'transaction';
  message: string;
  statusCode: number;
};

export const TransactionNotFoundError = (messageError?: string): TransactionError => ({
  kind: 'transaction',
  message: messageError ?? 'Transaction Not Found',
  statusCode: 404,
});

export const TransactionAlreadyProcessedError = (
  messageError?: string,
): TransactionError => ({
  kind: 'transaction',
  message: messageError ?? 'The Transaction already processed',
  statusCode: 400,
});


export const TransactionGenericError = (
  messageError?: string,
): TransactionError => ({
  kind: 'transaction',
  message: messageError ?? 'The Transaction ',
  statusCode: 400,
});