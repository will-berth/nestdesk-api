import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from '../guards/auth.guard';
import { AddUserToProjectDto } from './dto/add-user-to-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private projectsService: ProjectsService) {}

    @Post('')
    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
        const publicId = req.user.public_id;
        return this.projectsService.create(createProjectDto, publicId);
    }

    @Post(':projectId/users')
    @UseGuards(AuthGuard)
    addUserToProject(@Body() addUserDto: AddUserToProjectDto, @Param('projectId') projectId: string) {
        addUserDto.project_id = projectId;
        return this.projectsService.addUser(addUserDto);
    }
    
    @Get(':projectId/users')
    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    getUsers(@Param('projectId') projectId: string) {
        return this.projectsService.getUsers(projectId);
    }
}
