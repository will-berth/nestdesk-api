import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './models/project.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Project
    ])
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService]
})
export class ProjectsModule { }
