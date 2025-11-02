import { Module } from '@nestjs/common';
import { InventoryModel } from './contexts/inventory/infraestructure/inventory.module';
import { OrderModule } from './contexts/order/infraestructure/order.module';

@Module({
  imports: [InventoryModel, OrderModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
