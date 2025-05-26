import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
// import { UsersService } from '../users/users.service';
// import { ProjectsService } from '../projects/projects.service';
import { In } from "typeorm";
import { TicketChangeType, TicketsTracker } from './models/tickets-tracker.entity';
import { AddCommentToTicketDto } from './dto/add-comment-to-ticket.dto';
import { TicketsComments } from './models/tickets-comments.entity';
import { SummaryFilterDto } from './dto/summary-filter.dto';
import { ITicketService } from '../interfaces/ticket-service.interface';
import { IProjectService, PROJECT_SERVICE } from 'src/interfaces/project-service.interface';
import { IUserService, USER_SERVICE } from 'src/interfaces/user-service.interface';

@Injectable()
export class TicketsService implements ITicketService{
    constructor(
        @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
        @InjectRepository(TicketsTracker) private ticketTrackerRepository: Repository<TicketsTracker>,
        @InjectRepository(TicketsComments) private ticketsCommentsRepository: Repository<TicketsComments>,
        @Inject(USER_SERVICE) private readonly userFetcher: IUserService,
        @Inject(PROJECT_SERVICE) private readonly projectService: IProjectService,
        private entityManager: DataSource
    ) { }

    private async runTransaction<T>(callback: (trx: EntityManager) => Promise<T>): Promise<T> {
        return await this.entityManager.transaction(async (trx) => {
            return await callback(trx);
        });
    }

    async findOrFail(where: any): Promise<Ticket> {
        const ticket = await this.ticketRepository.findOne({ where });
        if (!ticket) throw new HttpException({
            message: 'Ticket not found',
            code: 'TICKET_NOT_FOUND',
        }, HttpStatus.CONFLICT);
        return ticket;
    }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const { created_by, project_id, assigned_to, ...dataTicket } = createTicketDto;
        const [users, project] = await Promise.all([
            this.userFetcher.findBy({ public_id: In([created_by, assigned_to]) }),
            this.projectService.findByPublicId(project_id)
        ])

        return await this.runTransaction<Ticket>(async (trx): Promise<Ticket> => {
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

        if (filter?.userPublicId) {
            tickets.andWhere('assigne.public_id = :userPublicId', { userPublicId: filter.userPublicId });
        }



        return tickets.getMany();
    }

    async addComment(ticketPublicId: string, addCommentDto: AddCommentToTicketDto): Promise<TicketsComments> {
        const [ticket, creator] = await Promise.all([
            this.findOrFail({ public_id: ticketPublicId }),
            this.userFetcher.findByPublicId(addCommentDto.commented_by)
        ])

        return await this.runTransaction<TicketsComments>(async (trx): Promise<TicketsComments> => {
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

    async findSummary(filter: SummaryFilterDto): Promise<any> {
        if(Object.keys(filter).length === 0){
            return []
        }
        const baseQuery = this.ticketRepository.createQueryBuilder('tickets')
            .leftJoin('tickets.project', 'project')
            .leftJoin('tickets.assignee', 'assigne')
            .leftJoin('tickets.creator', 'creator')
            .where('tickets.deleted = false')
    
        if (filter?.project_public_id) {
            baseQuery.andWhere('project.public_id = :projectPublicId', { projectPublicId: filter.project_public_id });
        }
    
        if (filter?.assigne_public_id) {
            baseQuery.andWhere('assigne.public_id = :userPublicId', { userPublicId: filter.assigne_public_id });
        }
    
        if (filter?.start_date) {
            baseQuery.andWhere('tickets.created_at >= :startDate', { startDate: filter.start_date });
        }
    
        if (filter?.end_date) {
            baseQuery.andWhere('tickets.created_at <= :endDate', { endDate: filter.end_date });
        }
    
        const ticketsQuery = baseQuery.clone();
        
        const totalQuery = baseQuery.clone()
            .select('COUNT(tickets.id)', 'total');
        
        const completedQuery = baseQuery.clone()
            .andWhere('tickets.status IN (:...statuses)', { statuses: ['resolved', 'closed'] })
            .select('COUNT(tickets.id)', 'completed');

        if(filter?.sort_by){
            const sort = filter?.sort ?? 'ASC'
            ticketsQuery.orderBy(`
                CASE 
                    WHEN tickets.priority = 'high' THEN 1
                    WHEN tickets.priority = 'medium' THEN 2
                    WHEN tickets.priority = 'low' THEN 3
                    ELSE 4
                END
            `, sort);
        }
        
        const [tickets, totalResult, completedResult] = await Promise.all([
            ticketsQuery.getMany(),
            totalQuery.getRawOne(),
            completedQuery.getRawOne()
        ]);
        
        const total = parseInt(totalResult?.total || '0');
        const completed = parseInt(completedResult?.completed || '0');
        
        return {
            tickets,
            summary: {
                total,
                completed,
                pending: total - completed
            }
        };
    }
}
