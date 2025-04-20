import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {

    constructor(
        @InjectRepository(Project) private projectRepository: Repository<Project>,
        private usersService: UsersService
    ) { }

    async create(createProjectDto: CreateProjectDto, userPublicId: string) {
        const creator = await this.usersService.findByPublicId(userPublicId);

        if(creator) createProjectDto.created_by = creator.id;
        const project = this.projectRepository.create(createProjectDto);
        return await this.projectRepository.save(project);
    }
}
