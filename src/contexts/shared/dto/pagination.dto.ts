import { Type } from "class-transformer"
import { IsNumber, IsPositive, Max, Min } from "class-validator"

export class PaginationDto {
  
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Type(()=> Number)
  page?: number = 1


  @IsNumber()
  @Max(30)
  @Min(1)
  @Type(()=> Number)
  limit?: number = 30
  
}