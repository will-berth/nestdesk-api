import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from 'class-transformer';
import { Project } from '../../projects/models/project.entity';

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