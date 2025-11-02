import { Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
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
import { TransactionStatus } from '../../../transactions/domain/transaction';

export class CreateOrderUseCase {
  private logger: Logger = new Logger('CreateOrderUseCase');
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
  }: CreateOrderDto): Promise<Result<{ orderId: string }, OrderError>> {
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
        return ok({
          orderId: prev.value.id,
          transactionId: prev.value.transactionId ?? '',
        });
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

    let totalAmount = 0;
    const itemsToPersist = orderItems.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      const productPrice = p.price;
      const lineTotal = productPrice * it.quantity;
      totalAmount += lineTotal;
      return {
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: productPrice,
        lineTotal,
      };
    });

    try {
      const created = await this.orderRepo.runInTransaction(async (tx) => {
        const upsertCust = await this.customerRepo.upsertByIdTx(
          customerId,
          {
            ...delivery,
            id: customerId,
          },
          tx,
        );
        if (upsertCust.isOk === false) throw upsertCust.error;

        const createOrderRes = await this.orderRepo.createOrder(
          {
            customerId,
            status: OrderStatus.CANCELLED,
            totalAmount,
            id: orderId,
            orderItem: itemsToPersist,
          },
          tx,
        );

        if (createOrderRes.isOk === false) throw createOrderRes.error;
        const createdOrder = createOrderRes.value;

        const txRes = await this.transactionRepo.createTransactionTx(
          {
            orderId: createdOrder.orderId,
            totalAmount,
            // baseFee: 0,
            // deliveryFee: 0,
            payerName: delivery.name,
            paymentStatus: TransactionStatus.PENDING,

            // metadata: { source: 'checkout' }
          },
          tx,
        );
        if (txRes.isOk === false) throw txRes.error;

        const dec = await this.inventoryRepo.reserveStockTx(
          itemsToPersist.map((i) => ({ quantity: i.quantity, id: i.quantity })),
          tx,
        );
        if (dec.isOk === false) throw dec.error;

        return { order: createdOrder, transaction: { id: txRes.value } };
      });

      return ok({
        orderId: created.order.orderId,
        transactionId: created.transaction.id,
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
