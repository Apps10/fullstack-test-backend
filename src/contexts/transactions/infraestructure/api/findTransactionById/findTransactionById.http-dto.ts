import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class FindTransactionByIdHttpDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;
}
