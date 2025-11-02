import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { TransactionPrismaSchema } from './TransactionPrismaSchema';
import { TransactionRepository } from '../domain/transaction.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    TransactionPrismaSchema,
    {
      provide: TransactionRepository,
      useExisting: TransactionPrismaSchema,
    },
  ],
  exports: [TransactionPrismaSchema],
})
export class TransactionModule {}
