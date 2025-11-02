// import { Injectable } from 'src/contexts/shared/dependency-injection/injectable';
// import { Controller, Get, Param, Put } from '@nestjs/common';
// import { updateProductStockUseCase } from 'src/contexts/inventory/application/update-stock/update-product-stock-use-case';
// import { UpdateProductStockHttpDto } from './update-product-stock.http-dto';

// @Injectable()
// @Controller('product')
// export class UpdateProductStockController {
//   constructor(private updateStockUseCase: updateProductStockUseCase) {}

//   @Put('/:id')
//   async run(@Param() dto: UpdateProductStockHttpDto) {
//     try {
//       const product = await this.updateStockUseCase.execute(dto);

//       return {
//         Product: product.toApiJson(),
//       };
//     } catch (error) {
//       throw new Error(error);
//     }
//   }
// }
