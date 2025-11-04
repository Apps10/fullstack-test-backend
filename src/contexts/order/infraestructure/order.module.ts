import { Module } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { CreateOrderUseCase } from '../application/create-order/create-order-use-case';
import { CreateOrderController } from './api/create-order/create-order.controller';
import { OrderSchemaPrisma } from './orderSchema-prisma';
import { InventoryModel } from '../../inventory/infraestructure/inventory.module';
import { OrderRepository } from '../domain/order.repository';
import { InventoryRepository } from '../../inventory/domain/inventory-repository.';
import { InventorySchemaPrisma } from '../../inventory/infraestructure/inventorySchema-prisma';
import { CustomerRepository } from '../../customers/domain/customer.repository';
import { TransactionRepository } from '../../transactions/domain/transaction.repository';
import { CustomerModule } from '../../customers/infraestructure/customer.module';
import { CustomerPrismaSchema } from '../../customers/infraestructure/customerSchema-prisma';
import { TransactionModule } from '../../transactions/infraestructure/transaction.module';
import { TransactionPrismaSchema } from '../../transactions/infraestructure/TransactionPrismaSchema';
import { CheckOutController } from './api/checkout/checkout.controller';
import { CheckoutUseCase } from '../application/checkout/checkout';
import { PaymentService } from '../domain/paymentService';
import { WompiPaymentService } from './service/wompi.payment.service';

@Module({
  imports: [InventoryModel, CustomerModule, TransactionModule],
  controllers: [CreateOrderController, CheckOutController],
  providers: [
    CreateOrderUseCase,
    CheckoutUseCase,
    PrismaService,
    OrderSchemaPrisma,
    WompiPaymentService,
    {
      provide: OrderRepository,
      useExisting: OrderSchemaPrisma,
    },
    {
      provide: PaymentService,
      useExisting: WompiPaymentService,
    },
    {
      provide: CreateOrderUseCase,
      useFactory: (
        orderRepo: OrderRepository,
        inventoryRepo: InventoryRepository,
        customerRepo: CustomerRepository,
        transactionRepo: TransactionRepository,
      ) =>
        new CreateOrderUseCase(
          inventoryRepo,
          orderRepo,
          customerRepo,
          transactionRepo,
        ),
      inject: [
        OrderSchemaPrisma,
        InventorySchemaPrisma,
        CustomerPrismaSchema,
        TransactionPrismaSchema,
      ],
    },
    {
      provide: CheckoutUseCase,
      useFactory: (
        orderRepo: OrderRepository,
        transactionRepo: TransactionRepository,
        paymentService: PaymentService,
      ) =>
        new CheckoutUseCase(
          orderRepo,
          transactionRepo,
          paymentService
        ),
      inject: [
        OrderSchemaPrisma,
        TransactionPrismaSchema,
        WompiPaymentService,
      ],
    },
  ],
  exports: [],
})
export class OrderModule {}
