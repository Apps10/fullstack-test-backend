import { Result } from '../../shared/models/result';
import { ICheckProductStock, Product } from './product';
import { InventoryError } from './inventory.exceptions';

export abstract class InventoryRepository {
  abstract checkAvailability(
    items: ICheckProductStock[],
  ): Promise<Result<true, InventoryError>>;

  abstract getAllProductsInStock(
  ): Promise<Result<Product[], InventoryError>>;

  abstract findProductById(
    productId: number,
  ): Promise<Result<Product, InventoryError>>;

  abstract findProductsById(
    productIds: number[],
  ): Promise<Result<Product[], InventoryError>>;

  abstract reserveStockTx(
    items: ICheckProductStock[],
    tx,
  ): Promise<Result<true, InventoryError>>;

  abstract releaseStockTx(
    items: ICheckProductStock[],
    tx,
  ): Promise<Result<true, InventoryError>>;
}
