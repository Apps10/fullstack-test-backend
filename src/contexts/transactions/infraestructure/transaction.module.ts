import { Module } from '@nestjs/common';
import { TransactionPrismaSchema } from './TransactionPrismaSchema';
import { TransactionRepository } from '../domain/transaction.repository';
import { PrismaService } from '../../shared/services/prisma-client';
import { FindTransactionByIdController } from './api/findTransactionById/findTransactionById.controller';
import { FindTransactionByIdUseCase } from '../application/findTransactionById/findTransactionById.useCase';

@Module({
  imports: [],
  controllers: [FindTransactionByIdController],
  providers: [
    PrismaService,
    TransactionPrismaSchema,
    {
      provide: TransactionRepository,
      useExisting: TransactionPrismaSchema,
    },
    FindTransactionByIdUseCase,
  ],
  exports: [TransactionPrismaSchema],
})
export class TransactionModule {}
