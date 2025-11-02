import { IsNumber } from "class-validator";

export class UpdateProductStockDto {
  @IsNumber()
  id: number

  @IsNumber()
  quantityToSubtract: number
}