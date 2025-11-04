import { Logger, LoggerService } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma-client';
import { Injectable } from '../../shared/dependency-injection/injectable';
import { err, ok, Result } from '../../shared/models/result';
import { OrderError, OrderGenericError, OrderNotFoundError } from '../domain/order.exception';
import { OrderRepository } from '../domain/order.repository';
import { Order, PrimitiveOrder } from '../domain/order';
import { OrderStatus } from '../domain/orderStatus.enum';

@Injectable()
export class OrderSchemaPrisma implements OrderRepository {
  private readonly loggerService: LoggerService;

  constructor(private readonly prisma: PrismaService) {
    this.loggerService = new Logger('OrderSchemaPrisma');
  }

  async findById(id: string): Promise<Result<Order, OrderError>> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { OrderItem: true },
      });

      if (!order) {
        return err(OrderNotFoundError());
      }

      return ok(
        new Order({
          ...order,
          orderItem: order.OrderItem.map((oi) => ({
            ...oi,
            lineTotal: oi.lineTotal.toNumber(),
            unitPrice: oi.unitPrice.toNumber(),
          })),
          status: order.status as OrderStatus,
          totalAmount: order.totalAmount.toNumber(),
          baseFee: order.baseFee.toNumber(),
          taxFee: order.taxFee.toNumber()
        }),
      );
    } catch (e) {
      this.loggerService.error(e);
    }
  }

  async runInTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      fn,
      { timeout: 100000 }, //TODO: eliminar, solo para debuggear
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
    const { orderItem, ...res } = payload;
    try {
      const newOrder = await client.order.create({
        data: {
          ...res,
          OrderItem: {
            createMany: {
              data: [...orderItem],
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
        return ok({ orderId: newOrder.id });
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

  async updateOrderTx(orderId: string, updateOrderStatusDto: Partial<PrimitiveOrder>, tx?: PrismaService): Promise<Result<true, OrderError>> {
    const client = tx ?? this.prisma
    const { id, ...payload} =  updateOrderStatusDto
    const order = await client.order.update({
      where: { id: orderId },
      data: payload,
    });
    return order ? ok(true): err(OrderGenericError(`Error Updating the order`));
 }
}
