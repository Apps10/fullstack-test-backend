import { Order, PrimitiveOrder } from '../../order/domain/order';
import { Result } from '../../shared/models/result';
import { PrimitiveTransaction, Transaction } from './transaction';
import { TransactionError } from './transactionException';

export abstract class TransactionRepository {
  abstract createTransactionTx(
    transaction: PrimitiveTransaction,
    tx?: any,
  ): Promise<Result<Transaction, TransactionError>>;

  abstract findOrderByTransactionId(
    transactionId: string,
  ): Promise<Result<Transaction & { order: Omit<PrimitiveOrder,'orderItem'> }, TransactionError>>;

   abstract findById(
    transactionId: string,
  ): Promise<Result<Transaction, TransactionError>>;


  abstract updateTransaction(
    transactionId: string,
    transaction: Partial<PrimitiveTransaction>,
  ): Promise<Result<true, TransactionError>>;
}
