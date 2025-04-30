import { Exclude } from "class-transformer";
import { Project } from "../../projects/models/project.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../../users/models/user.entity";
import { TicketsComments } from "./tickets-comments.entity";

enum TicketStatus {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    QA = 'qa',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

@Entity({ name: 'tickets' })
export class Ticket {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true})
    id: number;
    
    @Column({ unique: true })
    public_id: string;
    
    @Column()
    @Exclude({ toPlainOnly: true})
    created_by: number;
    
    @Column()
    @Exclude({ toPlainOnly: true})
    project_id: number;
    
    @Column()
    @Exclude({ toPlainOnly: true})
    assigned_to: number;

    @Column()
    name: string;

    @Column()
    description: string;
    
    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.TODO
    })
    status: TicketStatus;

    @Column({
        type: 'enum',
        enum: TicketPriority,
        nullable: true
    })
    priority: TicketPriority;

    @Column({
        default: false
    })
    deleted: boolean;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @ManyToOne(
        () => Project,
        (project) => project.tickets
    )
    @JoinColumn({ name: 'project_id' })
    project: Project;
    
    @ManyToOne(
        () => User,
        (user) => user.createdTickets
    )
    @JoinColumn({ name: 'created_by' })
    creator: User;
    
    @ManyToOne(
        () => User,
        (user) => user.assignedTickets
    )
    @JoinColumn({ name: 'assigned_to' })
    assignee: User;

    @OneToMany(
        () => TicketsComments,
        (comment) => comment.ticket
    )
    comments: TicketsComments[];

    @BeforeInsert()
    generateTicket(){
        this.public_id = uuidv4();
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    @BeforeUpdate()
    updateTicket(){
        this.updated_at = new Date();
    }
}