import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';
import { User } from '../../users/models/user.entity';


@Entity({name: 'projects'})
export class Project {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true })
    id: number;
    
    @Column({unique: true})
    public_id: string;
    
    @Column()
    @Exclude({ toPlainOnly: true })
    created_by: number;

    @Column({unique: true})
    name: string;
    
    @Column()
    deleted: boolean;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @ManyToOne(
        () => User,
        (user) => user.projects,
        // { cascade: true }
    )
    @JoinColumn({ name: 'created_by' })
    user: User

    @BeforeInsert()
    generateUser(){
        this.public_id = uuidv4();
        this.created_at = new Date();
        this.updated_at = new Date();
    }

    @BeforeUpdate()
    updateDate(){
        this.updated_at = new Date();
    }
}