import { IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../../../generated/prisma';

export class CreateCoinTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  gameId?: number;
}
