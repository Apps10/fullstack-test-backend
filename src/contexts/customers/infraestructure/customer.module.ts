import { Module } from '@nestjs/common';
import { CustomerPrismaSchema } from './customerSchema-prisma';
import { CustomerRepository } from '../domain/customer.repository';
import { PrismaService } from '../../shared/services/prisma-client';

@Module({
  controllers: [],
  providers: [
    CustomerPrismaSchema,
    PrismaService,
    {
      provide: CustomerRepository,
      useExisting: CustomerPrismaSchema,
    },
  ],
  exports: [CustomerPrismaSchema],
})
export class CustomerModule {}
