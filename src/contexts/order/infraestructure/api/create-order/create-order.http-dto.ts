
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { OrderItemDto } from "../shared/order-item.dto";
import { PrimitiveOrderItem } from "../../../domain/orderItem";


class DeliveryHttpDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;
}

export class CreateOrderHttpDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true}) //validar cada elemento del  array
    @Type(()=> OrderItemDto)
    orderItems: PrimitiveOrderItem[] 

    @IsNotEmpty()
    @ValidateNested()
    @Type(()=> DeliveryHttpDto)
    delivery: DeliveryHttpDto

    @IsOptional()
    @IsString()
    @IsUUID()
    customerId?: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    orderId?: string;
}
