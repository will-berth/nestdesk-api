import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddCommentToTicketDto } from './dto/add-comment-to-ticket.dto';

@Controller('tickets')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard, RolesGuard)
export class TicketsController {
    constructor(private ticketsService: TicketsService) {}


    @Post('')
    @Roles(['project_admin', 'agent', 'reporter'])
    create(@Body() createTicketDto: CreateTicketDto) {
        return this.ticketsService.create(createTicketDto);
    }

    @Get('')
    find(@Query() query: { projectPublicId: string }){
        const { projectPublicId, ...filter } = query;
        return this.ticketsService.find(projectPublicId, filter);
    }

    @Post('/:ticketId')
    addComment(@Body() addCommentDto: AddCommentToTicketDto, @Param('ticketId') ticketId: string){
        return this.ticketsService.addComment(ticketId, addCommentDto);
    }
}
