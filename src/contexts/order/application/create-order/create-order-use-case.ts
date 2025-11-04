import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  OrderAlreadyProcessedError,
  OrderError,
  OrderShouldHaveItemsError,
} from '../../domain/order.exception';
import { err, ok, Result } from '../../../shared/models/result';
import { InventoryRepository } from '../../../inventory/domain/inventory-repository.';
import { OrderRepository } from '../../domain/order.repository';
import { CreateOrderDto } from './create-order-dto';
import { Product } from '../../../inventory/domain/product';
import { OrderStatus } from '../../domain/orderStatus.enum';
import { CustomerRepository } from '../../../customers/domain/customer.repository';
import { TransactionRepository } from '../../../transactions/domain/transaction.repository';
import {
  PrimitiveTransaction,
  TransactionStatus,
} from '../../../transactions/domain/transaction';

export class CreateOrderUseCase {
  private logger: Logger = new Logger('CreateOrderUseCase');
  private readonly IVA = 19;
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly orderRepo: OrderRepository,
    private readonly customerRepo: CustomerRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async execute({
    orderItems,
    orderId = uuidv4(),
    customerId = uuidv4(),
    delivery,
  }: CreateOrderDto): Promise<
    Result<
      {
        orderId: string;
        customerId: string;
        transaction: Omit<PrimitiveTransaction, 'id' | 'paymentMethodId'>;
      },
      OrderError
    >
  > {
    if (!orderItems || orderItems.length === 0) {
      return err(OrderShouldHaveItemsError());
    }

    if (!delivery) {
      return err({
        kind: 'order',
        message: 'delivery info is required',
        statusCode: 400,
      });
    }

    for (const it of orderItems) {
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
        return err({
          kind: 'order',
          message: `Invalid quantity in orderItems`,
          statusCode: 400,
        });
      }
    }

    if (orderId) {
      const prev = await this.orderRepo.findByIdIfIsProccesed(orderId);
      if (prev.isOk && prev.value) {
        return err(OrderAlreadyProcessedError());
      }
    }

    const productsId = orderItems.map((oi) => oi.productId);
    const productsRes = await this.inventoryRepo.findProductsById(productsId);
    if (productsRes.isOk === false) {
      return err(productsRes.error);
    }

    const products = productsRes.value as Product[];

    const validateStock = await this.inventoryRepo.checkAvailability([
      ...orderItems.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
      })),
    ]);
    if (validateStock.isOk === false) {
      return err(validateStock.error);
    }

    let baseFee = 0;
    const itemsToPersist = orderItems.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      const productPrice = p.price;
      const lineTotal = productPrice * it.quantity;
      baseFee += lineTotal;
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: productPrice,
        lineTotal,
      };
    });

    try {
      const created = await this.orderRepo.runInTransaction(async (tx) => {
        const upsertCust = await this.customerRepo.upsertByIdOrEmailTx(
          customerId,
          {
            ...delivery,
            id: customerId,
          },
          tx,
        );
        if (upsertCust.isOk === false) throw upsertCust.error;
        const taxFee = Math.round(baseFee * (this.IVA/100));
        const totalAmount = Math.round((baseFee + taxFee) * 100) / 100;
        const createOrderRes = await this.orderRepo.createOrder(
          {
            customerId,
            status: OrderStatus.PENDING,
            totalAmount,
            id: orderId,
            orderItem: itemsToPersist,
            baseFee,
            taxFee
          },
          tx,
        );

        if (createOrderRes.isOk === false) throw createOrderRes.error;
        const createdOrder = createOrderRes.value;

        const txRes = await this.transactionRepo.createTransactionTx(
          {
            orderId: createdOrder.orderId,
            totalAmount,
            baseFee,
            payerName: delivery.name,
            paymentStatus: TransactionStatus.PENDING,
            taxFee
            // metadata: { source: 'checkout' }
          },
          tx,
        );
        if (txRes.isOk === false) throw txRes.error;

        const dec = await this.inventoryRepo.reserveStockTx(
          itemsToPersist.map((i) => ({ quantity: i.quantity, id: i.productId })),
          tx,
        );
        if (dec.isOk === false) throw dec.error;

        return { order: createdOrder, transaction: txRes.value, customerId: upsertCust.value.id };
      });

      return ok({
        orderId: created.order.orderId,
        customerId: created.customerId,
        transaction: created.transaction,
      });
    } catch (e: any) {
      this.logger.error(e);
      return err({
        kind: 'order',
        message: 'Order failed, try later',
        statusCode: 500,
      });
    }
  }
}
