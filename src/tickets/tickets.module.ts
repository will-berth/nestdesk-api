import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    TypeOrmModule.forFeature([
      Ticket
    ])
  ],
  controllers: [TicketsController],
  providers: [TicketsService]
})
export class TicketsModule {}
