import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { Repository } from 'typeorm';
import { ProjectUser } from './models/project-user.entity';
import { AddUserToProjectDto } from './dto/add-user-to-project.dto';
import { IRoleService, ROLE_SERVICE } from 'src/interfaces/role-service.interface';
import { IProjectService } from 'src/interfaces/project-service.interface';
import { IUserService, USER_SERVICE } from 'src/interfaces/user-service.interface';

@Injectable()
export class ProjectsService implements IProjectService {

    constructor(
        @InjectRepository(Project) private projectRepository: Repository<Project>,
        @InjectRepository(ProjectUser) private projectUserRepository: Repository<ProjectUser>,
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        @Inject(ROLE_SERVICE) private readonly rolesService: IRoleService
    ) { }

    async create(createProjectDto: CreateProjectDto, userPublicId: string) {
        const projectDb = await this.findByName(createProjectDto.name);
        if (projectDb) {
            throw new HttpException({
                message: 'Project with this name already exists',
                code: 'PROJECT_ALREADY_EXISTS',
            }, HttpStatus.CONFLICT);
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
        if(projectUserDb) throw new HttpException({
            message: 'User already exists in this project',
            code: 'USER_ALREADY_EXISTS_IN_PROJECT',
        }, HttpStatus.CONFLICT);

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

    async findOrFail(where: any): Promise<Project> {
        const project = await this.projectRepository.findOneOrFail({where});
        if(!project) throw new HttpException({
            message: 'Project not found',
            code: 'PROJECT_NOT_FOUND',
        }, HttpStatus.CONFLICT);
        return project;
    }

    async findByPublicId(public_id: string): Promise<Project> {
        return await this.findOrFail({ public_id });
    }
    
    async findUserRolesByUserAndProject(projectPublicId: string, userPublicId: string): Promise<ProjectUser | null> {
        const roles = await this.projectUserRepository.findOne({
            where: {
                project: { public_id: projectPublicId },
                user: { public_id: userPublicId }
            },
            relations: {
                role: true
            }
        });

        return roles;
    }
}
