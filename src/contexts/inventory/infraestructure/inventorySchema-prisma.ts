import { PrismaService } from '../../shared/services/prisma-client';
import { Injectable } from '../../shared/dependency-injection/injectable';
import { err, ok, Result } from '../../shared/models/result';
import { ICheckProductStock, Product } from '../domain/product';
import { InventoryRepository } from '../domain/inventory-repository.';
import {
  InventoryError,
  ProductNotFoundError,
  ProductsWithoutStockOrNotExistError,
} from '../domain/inventory.exceptions';
import { Logger } from '@nestjs/common';

@Injectable()
export class InventorySchemaPrisma implements InventoryRepository {
  private logger = new Logger('InventorySchemaPrisma');
  constructor(private readonly prisma: PrismaService) {}

  async reserveStockTx(
    items: ICheckProductStock[],
    tx: PrismaService,
  ): Promise<Result<true, InventoryError>>  {

    const client = tx ?? this.prisma;
    try {
      for (const it of items) {
        const res = await client.product.updateMany({
          where: { id: it.id, stock: { gte: it.quantity } },
          data: { stock: { decrement: it.quantity } },
        });
        if (res.count === 0) {
          return err(
            ProductsWithoutStockOrNotExistError(
              `Insufficient stock for ${it.id}`,
            ),
          );
        }
      }
      return ok(true);
    } catch (e) {
      this.logger.error(e)
      return err({
        kind: 'inventory',
        message: 'Error Reserving Stock, try later',
        statusCode: 500,
      });
    }
  }


 async releaseStockTx(items: ICheckProductStock[], tx: any): Promise<Result<true, InventoryError>> {
   return;
 }

  

  async findProductsById(
    productIds: number[],
  ): Promise<Result<Product[], InventoryError>> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (productIds.length !== products.length) {
      return err(
        ProductNotFoundError(
          `Any Products Doesnt exist, Verify each productIds`,
        ),
      );
    }

    return products
      ? ok(
          products.map((p) => new Product({ ...p, price: p.price.toNumber() })),
        )
      : err(ProductNotFoundError());
  }

  async getAllProductsInStock(): Promise<Result<Product[], InventoryError>> {
    const products = await this.prisma.product.findMany();
    return products
      ? ok(
          products.map(
            (p) =>
              new Product({
                ...p,
                price: p.price.toNumber(),
              }),
          ),
        )
      : err(ProductNotFoundError());
  }

  async findProductById(id: number): Promise<Result<Product, InventoryError>> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    return product
      ? ok(new Product({ ...product, price: product.price.toNumber() }))
      : err(ProductNotFoundError(`Product with id ${id} doesnt exist`));
  }

  async checkAvailability(
    items: ICheckProductStock[],
  ): Promise<Result<true, InventoryError>> {
    for (let i = 0; i <= items.length - 1; i++) {
      const currentItem = items[i];

      const product = await this.prisma.product.findUnique({
        where: { id: currentItem.id },
      });
      if (product.stock < currentItem.quantity) {
        return err(ProductsWithoutStockOrNotExistError());
      }
    }

    return ok(true);
  }
}
