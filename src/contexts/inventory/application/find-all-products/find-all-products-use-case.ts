import { FindAllProductsDto } from './find-all-products.dto';
import { Product } from '../../domain/product';
import { InventoryError } from '../../domain/inventory.exceptions';
import { Injectable } from '../../../shared/dependency-injection/injectable';
import { err, ok, Result } from '../../../shared/models/result';
import { InventoryRepository } from '../../domain/inventory-repository.';

@Injectable()
export class FindAllProductsUseCase {
  constructor(private readonly InventoryRepository: InventoryRepository) {}

  async execute(
    findAllProductDto: FindAllProductsDto,
  ): Promise<Result<Product[], InventoryError>> {
    const productsResult =
      await this.InventoryRepository.getAllProductsInStock();
    if (productsResult.isOk === false) {
      return err(productsResult.error);
    }
    return ok(productsResult.value);
  }
}
