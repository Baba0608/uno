import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCoinTransactionDto } from '../coin-transactions/dto/create-coin-transaction.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch(':id/add-coins')
  addCoins(
    @Param('id') id: string,
    @Body() createCoinTransactionDto: CreateCoinTransactionDto
  ) {
    return this.usersService.addCoins(+id, createCoinTransactionDto);
  }

  @Patch(':id/remove-coins')
  removeCoins(
    @Param('id') id: string,
    @Body() createCoinTransactionDto: CreateCoinTransactionDto
  ) {
    return this.usersService.removeCoins(+id, createCoinTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
