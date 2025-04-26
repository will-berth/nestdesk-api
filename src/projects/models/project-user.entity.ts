import { User } from "../../users/models/user.entity";
import { BeforeInsert, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { Project } from "./project.entity";
import { Exclude } from "class-transformer";
import { Role } from "../../roles/models/role.entity";


@Entity({ name: 'project_user' })
export class ProjectUser {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true })
    id: number;
    
    @Column()
    @Exclude({ toPlainOnly: true })
    user_id: number;
    
    @Column()
    @Exclude({ toPlainOnly: true })
    project_id: number;
    
    @Column()
    @Exclude({ toPlainOnly: true })
    role_id: number;
    
    @Column({ unique: true })
    public_id: string;
    
    @Column()
    deleted: boolean;

    @Column()
    joined_at: Date;

    @ManyToOne(() => User, (user) => user.projectUsers)
    @JoinColumn({ name: 'user_id' })
    user: User;
    
    @ManyToOne(() => Project, (project) => project.projectUsers)
    @JoinColumn({ name: 'project_id' })
    project: Project;
    
    @ManyToOne(() => Role, (role) => role.projectUsers)
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @BeforeInsert()
    generateUserBeforeInsert(){
        this.public_id = uuidv4();
        this.joined_at = new Date();
    }
}