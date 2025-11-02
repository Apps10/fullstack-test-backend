import { IsNumber } from "class-validator";

export class UpdateProductStockHttpDto  {
  @IsNumber()
  id: number

  @IsNumber()
  quantityToSubtract: number
}