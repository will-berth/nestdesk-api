import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';
import { Project } from '../../projects/models/project.entity';
import { ProjectUser } from '../../projects/models/project-user.entity';
import { Ticket } from '../../tickets/models/ticket.entity';
import { TicketsComments } from '../../tickets/models/tickets-comments.entity';

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true })
    id: number

    @Column({unique: true})
    public_id: string
    
    @Column()
    name: string
    
    @Column({unique: true})
    email: string
    
    @Column()
    @Exclude({ toPlainOnly: true })
    password: string
    
    @Column()
    created_at: Date
    
    @Column()
    updated_at: Date

    @OneToMany(
        () => Project,
        (project) => project.user,
        // { cascade: true }
    )
    projects: Project[]

    @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
    projectUsers: ProjectUser[];

    @OneToMany(
        () => Ticket,
        (ticket) => ticket.creator
    )
    createdTickets: Ticket[];
    
    @OneToMany(
        () => Ticket,
        (ticket) => ticket.assignee
    )
    assignedTickets: Ticket[];

    @OneToMany(
        () => TicketsComments,
        (comment) => comment.creators
    )
    commentedTickets: TicketsComments[];

    @BeforeInsert()
    generateUser(){
        this.public_id = uuidv4()
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    @BeforeUpdate()
    updateDate(){
        this.updated_at = new Date();
    }
}