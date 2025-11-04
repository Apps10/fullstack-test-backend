import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { err, ok, Result } from '../../shared/models/result';
import { PrimitiveTransaccionMetadata, PrimitiveTransaction, Transaction, TransactionStatus } from '../domain/transaction';
import { TransactionRepository } from '../domain/transaction.repository';
import {
  TransactionError,
  TransactionGenericError,
  TransactionNotFoundError,
} from '../domain/transactionException';
import { PrimitiveOrder } from '../../order/domain/order';
import { OrderStatus } from '../../order/domain/orderStatus.enum';

@Injectable()
export class TransactionPrismaSchema implements TransactionRepository {
  private logger = new Logger('TransactionPrismaSchema');
  constructor(private readonly prisma: PrismaService) {}

  
  async findOrderByTransactionId(transactionId: string)
  : Promise<Result<Transaction & { order: Omit<PrimitiveOrder, 'orderItem'>; }, TransactionError>> 
  {
    try{
      const transactionWithOrder = await this.prisma.transaction.findUnique({
      where: { id: transactionId},
      include: { order: true }
    })
    const order = transactionWithOrder.order

    return transactionWithOrder ? ok({
      ...transactionWithOrder,
      order: {
        ...order,
        totalAmount: order.totalAmount.toNumber(),
        status: order.status as OrderStatus,
        baseFee: order.baseFee.toNumber(),
        taxFee: order.taxFee.toNumber()
      },
      baseFee: transactionWithOrder.baseFee.toNumber(),
      taxFee: transactionWithOrder.taxFee.toNumber(),
      totalAmount: transactionWithOrder.totalAmount.toNumber(),
      paymentStatus: transactionWithOrder.paymentStatus as any,
    }) : err(TransactionNotFoundError())
    }catch(error){
      return err(TransactionNotFoundError())
    }
    
  }

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
        ? ok(
            new Transaction({
              ...transaction,

              id: newTransaction.id,
              payerTransactionId: transaction.payerTransactionId
            }),
          )
        : err(TransactionGenericError('Error creating the transaction'));
    } catch (e) {
      this.logger.error(e);
      return err(TransactionGenericError('Error creating the transaction'));
    }
  }

  async updateTransaction(
    transactionId: string,
    transaction: Partial<PrimitiveTransaction>,
  ): Promise<Result<true, TransactionError>> {
    try {
      const { id, ...payload } = transaction;

      const transactionUpdated = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: payload,
      });

      if (!transactionUpdated) {
        return err(TransactionGenericError('Error Updating '));
      }
    } catch (e) {
      this.logger.error(e);
      return err(TransactionGenericError());
    }
  }

  async findById(transactionId: string): Promise<Result<Transaction, TransactionError>> {
    try{
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: transactionId},
      })
    
    return transaction ? ok({
      ...transaction,
      totalAmount: transaction.totalAmount.toNumber(),
      paymentStatus: transaction.paymentStatus as any,
      baseFee: 0,
      taxFee: 0
    }) : err(TransactionNotFoundError())
    }catch(error){
      return err(TransactionNotFoundError())
    }
  }
}
