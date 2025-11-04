import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { Injectable } from "../../../../shared/dependency-injection/injectable";
import { CheckOutHttpDto } from "./checkout.http-dto";
import { CheckoutUseCase } from "../../../application/checkout/checkout";

@Controller('checkout')
@Injectable()
export class CheckOutController {
  constructor(private readonly checkoutUseCase: CheckoutUseCase) {}

  @Post()
  async run(
    @Body() dto: CheckOutHttpDto,
  ) {
    const result = await this.checkoutUseCase.execute(dto);
    if (result.isOk ===false ) {
      const { statusCode, message  } = result.error
      throw new HttpException(message as string, statusCode);
    }
    return { ok: true, Transaction: result.value};
  }
}
