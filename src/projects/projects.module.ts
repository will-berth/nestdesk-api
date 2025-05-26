import { forwardRef, Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { ProjectUser } from './models/project-user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { PROJECT_SERVICE } from 'src/interfaces/project-service.interface';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    TypeOrmModule.forFeature([
      Project,
      ProjectUser
    ])
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: PROJECT_SERVICE,
      useClass: ProjectsService
    }
  ],
  exports: [PROJECT_SERVICE]
})
export class ProjectsModule { }
