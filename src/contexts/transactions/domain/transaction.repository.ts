import { Result } from '../../shared/models/result';
import { PrimitiveTransaction, Transaction } from './transaction';
import { TransactionError } from './transactionException';

export abstract class TransactionRepository {
  abstract createTransactionTx(
    transaction: PrimitiveTransaction,
    tx?: any,
  ): Promise<Result<Transaction, TransactionError>>;
}
