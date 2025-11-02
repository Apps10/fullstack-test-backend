import { Type } from "class-transformer"
import { IsNumber, IsPositive } from "class-validator"

export class OrderItemDto {

  @IsNumber()
  @IsPositive()
  productId: number

  @IsNumber()
  @IsPositive()
  @Type(()=> Number)
  quantity: number

  @IsNumber({maxDecimalPlaces: 4})
  @Type(()=> Number)
  price: number
}