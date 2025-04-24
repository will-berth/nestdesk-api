import { Exclude } from "class-transformer";
import { ProjectUser } from "src/projects/models/project-user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'roles' })
export class Role {
    @PrimaryGeneratedColumn()
    @Exclude({ toPlainOnly: true })
    id: number;

    @Column({ unique: true })
    public_id: string;

    @Column({ unique: true })
    name: string;
    
    @Column({ unique: true })
    label: string;

    @OneToMany(() => ProjectUser, (projectUser) => projectUser.role)
    projectUsers: ProjectUser[];
}