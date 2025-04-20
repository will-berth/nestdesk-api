import { Body, ClassSerializerInterceptor, Controller, Post, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AuthGuard } from '../guards/auth.guard';

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
}
