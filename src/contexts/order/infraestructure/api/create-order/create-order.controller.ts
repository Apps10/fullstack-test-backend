import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { Injectable } from "../../../../shared/dependency-injection/injectable";
import { CreateOrderUseCase } from "../../../application/create-order/create-order-use-case";
import { CreateOrderHttpDto } from "./create-order.http-dto";

@Controller('order')
@Injectable()
export class CreateOrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async run(
    @Body() dto: CreateOrderHttpDto,
  ) {
    const result = await this.createOrderUseCase.execute(dto);
    if (result.isOk ===false ) {
      const { statusCode, message  } = result.error
      throw new HttpException(message as string, statusCode);
    }
    return result.value;
  }
}
