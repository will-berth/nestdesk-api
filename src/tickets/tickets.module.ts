import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { TicketsTracker } from './models/tickets-tracker.entity';
import { TicketsComments } from './models/tickets-comments.entity'
import { TICKET_SERVICE } from 'src/interfaces/ticket-service.interface';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    TypeOrmModule.forFeature([
      Ticket,
      TicketsTracker,
      TicketsComments
    ])
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: TICKET_SERVICE,
      useClass: TicketsService
    }
  ],
  exports: [TICKET_SERVICE]
})
export class TicketsModule {}
