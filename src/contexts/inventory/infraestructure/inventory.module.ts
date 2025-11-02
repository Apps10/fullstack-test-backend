import { Module } from '@nestjs/common';
import { FindAllProductsUseCase } from '../application/find-all-products/find-all-products-use-case';
import { PrismaService } from '../../shared/services/prisma-client';
import { InventoryRepository } from '../domain/inventory-repository.';
import { InventorySchemaPrisma } from './inventorySchema-prisma';
import { FindAllProductsController } from './api/find-all/find-all-products.controller';

@Module({
  controllers: [
    FindAllProductsController,
  ],
  providers: [
    FindAllProductsUseCase,
    InventorySchemaPrisma,
    PrismaService,
    {
      provide: InventoryRepository,
      useExisting: InventorySchemaPrisma,
    },
  ],
  exports: [
    FindAllProductsUseCase,
    InventorySchemaPrisma,
  ],
})
export class InventoryModel {}
