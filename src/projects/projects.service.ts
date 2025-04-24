import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ProjectUser } from './models/project-user.entity';
import { AddUserToProjectDto } from './dto/add-user-to-project.dto';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class ProjectsService {

    constructor(
        @InjectRepository(Project) private projectRepository: Repository<Project>,
        @InjectRepository(ProjectUser) private projectUserRepository: Repository<ProjectUser>,
        private usersService: UsersService,
        private rolesService: RolesService
    ) { }

    async create(createProjectDto: CreateProjectDto, userPublicId: string) {
        const projectDb = await this.findByName(createProjectDto.name);
        if (projectDb) {
            throw new HttpException('Project with this name already exists', HttpStatus.CONFLICT);
        }
        const creator = await this.usersService.findByPublicId(userPublicId);

        if(creator) createProjectDto.created_by = creator.id;
        const project = this.projectRepository.create(createProjectDto);
        return await this.projectRepository.save(project);
    }

    async findByName(name: string) {
        return await this.projectRepository.findOne({ where: { name } });
    }

    async addUser(addUserDto: AddUserToProjectDto){
        const [project, user, role] = await Promise.all([
            this.projectRepository.findOneOrFail({ where: { public_id: addUserDto.project_id } }),
            this.usersService.findByPublicId(addUserDto.user_id),
            this.rolesService.findByPublicId(addUserDto.role_id),
        ]);
        
        const projectUserDb = await this.projectUserRepository.findOne({ where: { user_id: user.id, project_id: project.id } });
        if(projectUserDb) throw new HttpException('User already exists in this project', HttpStatus.CONFLICT);

        const projectUser = this.projectUserRepository.create({
            user_id: user.id,
            project_id: project.id,
            role_id: role.id
        });

        return await this.projectUserRepository.save(projectUser);
    }

    async getUsers(projectId: string) {
        const project = await this.projectRepository.findOneOrFail({ where: { public_id: projectId } });
        return await this.projectUserRepository.find({
            where: { project_id: project.id },
            relations: {
                user: true,
                role: true
            }
        });
    }
}
