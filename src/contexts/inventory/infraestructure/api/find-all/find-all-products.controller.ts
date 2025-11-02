import { Controller, Get, Param } from '@nestjs/common';
import { Injectable } from '../../../../shared/dependency-injection/injectable';
import { FindAllProductsHttpDto } from './find-all-products.http-dto';
import { FindAllProductsUseCase } from '../../../application/find-all-products/find-all-products-use-case';

@Injectable()
@Controller('/product')
export class FindAllProductsController {
  constructor(
    private findAllProductUseCase: FindAllProductsUseCase,
  ) {}

  @Get('')
  async run(@Param() dto: FindAllProductsHttpDto) {
    const products = await this.findAllProductUseCase.execute(dto);
    if(products.isOk){
      return { 
        ok: true,
        Products: products.value
      }
    }
  }
}
