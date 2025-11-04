import { Injectable } from "../../../shared/dependency-injection/injectable";
import { err, ok, Result } from "../../../shared/models/result";
import { Transaction } from "../../domain/transaction";
import { TransactionRepository } from "../../domain/transaction.repository";
import { TransactionError } from "../../domain/transactionException";

@Injectable()
export class FindTransactionByIdUseCase {
  constructor(private readonly transactionRepo: TransactionRepository){}

  async execute(transactionId: string): Promise<Result<Transaction, TransactionError>>{
    const productsResult = await this.transactionRepo.findById(transactionId);
    if (productsResult.isOk === false) {
      return err(productsResult.error);
    }
    return ok(productsResult.value);
  }
}