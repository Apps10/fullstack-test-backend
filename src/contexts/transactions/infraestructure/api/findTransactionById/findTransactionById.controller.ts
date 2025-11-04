import { Controller, Get, HttpException, Param } from "@nestjs/common";
import { Injectable } from "../../../../shared/dependency-injection/injectable";
import { FindTransactionByIdHttpDto } from "./findTransactionById.http-dto";
import { FindTransactionByIdUseCase } from "../../../application/findTransactionById/findTransactionById.useCase";

@Controller('transaction')
@Injectable()
export class FindTransactionByIdController {
  constructor(private readonly useCase: FindTransactionByIdUseCase) {}

  @Get('/:transactionId')
  async run(
    @Param() { transactionId }: FindTransactionByIdHttpDto,
  ) {
    const result = await this.useCase.execute(transactionId);
    if (result.isOk ===false ) {
      const { statusCode, message  } = result.error
      throw new HttpException(message as string, statusCode);
    }
    return { ok: true, Transaction: result.value };
  }
}
