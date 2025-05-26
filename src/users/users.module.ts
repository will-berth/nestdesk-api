import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { USER_SERVICE } from 'src/interfaces/user-service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_SERVICE,
      useClass: UsersService
    }
  ],
  exports: [USER_SERVICE]
})
export class UsersModule {}
