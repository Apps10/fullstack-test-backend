import { Logger, LoggerService } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { Injectable } from '../../shared/dependency-injection/injectable';
import { err, ok, Result } from '../../shared/models/result';
import { OrderError } from '../domain/order.exception';
import { OrderRepository } from '../domain/order.repository';
import { PrimitiveOrder } from '../domain/order';

@Injectable()
export class OrderSchemaPrisma implements OrderRepository {
  private readonly loggerService: LoggerService;

  constructor(private readonly prisma: PrismaService) {
    this.loggerService = new Logger('OrderSchemaPrisma');
  }

  async runInTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn, 
      { timeout: 100000 } //TODO: eliminar, solo para debuggear
    );
  }

  async findByIdIfIsProccesed(
    id: string,
  ): Promise<Result<null | { id: string; transactionId: string }, OrderError>> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { transaction: true },
      });
      if (!order) {
        return ok(null);
      }

      return ok({
        id: order.id,
        transactionId: order.transaction?.[0]?.id ?? null,
      });
    } catch (e) {
      this.loggerService.error(e);
    }
  }

  async createOrder(
    payload: PrimitiveOrder,
    tx?: PrismaService,
  ): Promise<Result<{ orderId: string }, OrderError>> {
    const client = tx ?? this.prisma;
    const { orderItem, customerId, id, totalAmount, status } = payload;
    try {
      const newOrder = await client.order.create({
        data: {
          id,
          totalAmount,
          customerId,
          status,
          OrderItem: {
            createMany: {
              data: orderItem,
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              unitPrice: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      if (newOrder) {
        return ok({orderId: newOrder.id});
      }
    } catch (e) {
      this.loggerService.error(e);
      return err({
        kind: 'order',
        message: 'Error in create the Order',
        statusCode: 500,
      });
    }
  }

  async markCancelled(orderId: string): Promise<Result<null, any>> {
    return Promise.resolve(ok(null));
  }

  updateOrder(
    updateOrderStatusDto: PrimitiveOrder,
  ): Promise<Result<{ orderId: string }, OrderError>> {
    // return this.prisma.order.update({
    //   where: { id: orderId },
    //   data: {
    //     status,
    //     totalAmount,
    //     paidAt
    //   },
    // });
    return Promise.resolve(ok({ orderId: '' }));
  }
}
