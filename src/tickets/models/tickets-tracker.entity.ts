import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TicketChangeType {
    CREATED = 'created',
    STATUS_CHANGED = 'status_changed',
    PRIORITY_CHANGED = 'priority_changed',
    COMMENTED = 'commented',
    REASSIGNED = 'reassigned',
    TICKET_CLOSED = 'ticket_closed',
    TICKET_REOPENED = 'ticket_reopened'
}

@Entity({name: 'tickets_tracker'})
export class TicketsTracker {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    changed_by: number;
    
    @Column()
    ticket_id: number;
    
    @Column()
    comment_id: number;
    
    @Column()
    assigned_to: number;
    
    @Column()
    status: string;
    
    @Column()
    priority: string;
    
    @Column()
    change_type: TicketChangeType;
    
    @Column()
    date: Date;

    @BeforeInsert()
    generateDate(){
        this.date = new Date();
    }
}