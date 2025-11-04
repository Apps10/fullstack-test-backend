import {
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';


export class CheckOutHttpDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsString()
  creditCard: string;

  @IsString()
  @IsNotEmpty()
  emailHolder: string;
}
