import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createRoomDto: CreateRoomDto, @Req() req: any) {
    return this.roomsService.create(createRoomDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.roomsService.remove(+id);
  }
}
