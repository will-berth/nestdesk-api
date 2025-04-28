import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './models/ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { In } from "typeorm";

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
        private usersService: UsersService,
        private projectService: ProjectsService
    ) { }

    async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
        const { created_by, project_id, assigned_to, ...dataTicket } = createTicketDto;
        const [users, project] = await Promise.all([
            this.usersService.findBy({ public_id: In([created_by, assigned_to]) }),
            this.projectService.findByPublicId(project_id)
        ])

        const ticket = this.ticketRepository.create({
            ...dataTicket as Ticket,
            created_by: users[0].id,
            project_id: project.id,
            assigned_to: users[1].id
        });
        return await this.ticketRepository.save(ticket);
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

    async saveEvent(){
        
    }
}
