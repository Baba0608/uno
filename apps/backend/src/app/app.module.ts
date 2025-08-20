import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { GamesModule } from './games/games.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [UsersModule, RoomsModule, GamesModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
