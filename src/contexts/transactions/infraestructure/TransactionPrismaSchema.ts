import { Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { err, ok, Result } from '../../shared/models/result';
import { PrimitiveTransaction, Transaction } from '../domain/transaction';
import { TransactionRepository } from '../domain/transaction.repository';
import { 
  TransactionError, 
  TransactionGenericError 
} from '../domain/transactionException';

export class TransactionPrismaSchema implements TransactionRepository {
  private logger = new Logger('TransactionPrismaSchema');
  constructor(private readonly prisma: PrismaService) {}

  async createTransactionTx(
    transaction: PrimitiveTransaction,
    tx?: PrismaService,
  ): Promise<Result<Transaction, TransactionError>> {
    const client = tx ?? this.prisma;

    try {
      const newTransaction = await client.transaction.create({
        data: {
          ...transaction,
        },
      });

      return newTransaction
        ? ok(new Transaction({
          ...transaction,
          id: transaction.id,
        }))
        : err(TransactionGenericError('Error creating the transaction'));
    } catch (e) {
      this.logger.error(e);
      return err(TransactionGenericError('Error creating the transaction'));
    }
  }
}
