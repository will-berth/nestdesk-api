import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { In } from "typeorm";
import { TicketChangeType, TicketsTracker } from './models/tickets-tracker.entity';
import { AddCommentToTicketDto } from './dto/add-comment-to-ticket.dto';
import { TicketsComments } from './models/tickets-comments.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketsTracker) private ticketTrackerRepository: Repository<TicketsTracker>,
        @InjectRepository(TicketsComments) private ticketsCommentsRepository: Repository<TicketsComments>,
        private usersService: UsersService,
        private projectService: ProjectsService,
        private entityManager: DataSource
    ) { }

    private async runTransaction<T>(callback: (trx: EntityManager) => Promise<T>): Promise<T>{
        return await this.entityManager.transaction(async (trx) => {
            return await callback(trx);
        });
    }

    async findOrFail(where: any): Promise<Ticket>{
        const ticket = await this.ticketRepository.findOne({where});
        if(!ticket) throw new HttpException('Ticket does not exists', HttpStatus.CONFLICT);
        return ticket;
    }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const { created_by, project_id, assigned_to, ...dataTicket } = createTicketDto;
        const [users, project] = await Promise.all([
            this.usersService.findBy({ public_id: In([created_by, assigned_to]) }),
            this.projectService.findByPublicId(project_id)
        ])

        return await this.runTransaction<Ticket>(async(trx): Promise<Ticket> => {
            const ticket = this.ticketRepository.create({
                ...dataTicket as Ticket,
                created_by: users[0].id,
                project_id: project.id,
                assigned_to: users[1].id
            });
            const ticketSaved = await trx.save(ticket);
            
            const ticketTracker = this.ticketTrackerRepository.create({
                ...ticket,
                ticket_id: ticketSaved.id,
                changed_by: users[0].id,
                change_type: TicketChangeType.CREATED
            })
            await trx.save(ticketTracker);

            return ticketSaved
        })
    }

    async find(projectPublicId: string, filter: { userPublicId?: string }): Promise<Ticket[]> {
        const tickets = this.ticketRepository.createQueryBuilder('tickets')
            .leftJoin('tickets.project', 'project')
            .leftJoin('tickets.assignee', 'assigne')
            .where('project.public_id = :projectPublicId', { projectPublicId: projectPublicId })

        if(filter?.userPublicId){
            tickets.andWhere('assigne.public_id = :userPublicId', { userPublicId: filter.userPublicId });
        }
        


        return tickets.getMany();
    }

    async addComment(ticketPublicId: string, addCommentDto: AddCommentToTicketDto): Promise<TicketsComments>{
        const [ticket, creator ] = await Promise.all([
            this.findOrFail({ public_id: ticketPublicId}),
            this.usersService.findByPublicId(addCommentDto.commented_by)
        ])

        return await this.runTransaction<TicketsComments>(async(trx): Promise<TicketsComments> => {
            const comment = this.ticketsCommentsRepository.create({
                ticket_id: ticket.id,
                commented_by: creator.id,
                comment: addCommentDto.comment
            })
            const commentSaved = await trx.save(comment)

            const ticketTracker = this.ticketTrackerRepository.create({
                ...ticket,
                ticket_id: ticket.id,
                changed_by: creator.id,
                change_type: TicketChangeType.COMMENTED
            })
            await trx.save(ticketTracker);

            return commentSaved;
        })
    }

    async saveEvent(){
        
    }
}
