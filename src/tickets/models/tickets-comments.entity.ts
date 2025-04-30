import { Exclude } from "class-transformer";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Ticket } from "./ticket.entity";
import { User } from "../../users/models/user.entity";

@Entity({ name: 'tickets_comments'})
export class TicketsComments {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true})
    id: number;
    
    @Column({ unique: true})
    public_id: string;
    
    @Column()
    @Exclude({ toPlainOnly: true})
    ticket_id: number;
    
    @Column()
    @Exclude({ toPlainOnly: true})
    commented_by: number;
    
    @Column()
    comment: string;
    
    @Column()
    created_at: Date;
    
    @Column()
    updated_at: Date;

    @ManyToOne(
        () => Ticket,
        (ticket) => ticket.comments
    )
    @JoinColumn({ name: 'ticket_id'})
    ticket: Ticket;
    
    @ManyToOne(
        () => User,
        (user) => user.commentedTickets
    )
    @JoinColumn({ name: 'commented_by'})
    creators: User;

    @BeforeInsert()
    generateComment(){
        this.public_id = uuidv4();
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    @BeforeUpdate()
    updateComment(){
        this.updated_at = new Date();
    }
}