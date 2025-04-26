import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.entity';
import { ProjectUser } from './models/project-user.entity';
import { HttpException } from '@nestjs/common';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let usersService: UsersService;
  let projectRepository: Repository<Project>;
  let userRepository: Repository<User>;
  let projectUserRepository: Repository<ProjectUser>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([Project, User, ProjectUser]),
        UsersModule,
        RolesModule,
        JwtModule.register({
          global: true,
          secret: configService.getJwtSecret(),
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [ProjectsService],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    usersService = module.get<UsersService>(UsersService);
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    projectUserRepository = module.get<Repository<ProjectUser>>(getRepositoryToken(ProjectUser));

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'newuserprojectservice@example.com',
          password: 'Password123!',
          name: 'Test User'
        })
      );

      const createProjectDto = {
        name: 'Test Project',
        created_by: user.id
      };

      const result = await service.create(createProjectDto, user.public_id);

      expect(result).toBeDefined();
      expect(result.name).toBe(createProjectDto.name);
      expect(result.created_by).toBe(user.id);
      expect(result.public_id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should not create project with duplicate name', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'newuserprojectservice2@example.com',
          password: 'Password123!',
          name: 'Test User 2'
        })
      );

      const createProjectDto = {
        name: 'Duplicate Project',
        created_by: user.id
      };

      await service.create(createProjectDto, user.public_id);

      await expect(service.create(createProjectDto, user.public_id))
        .rejects.toThrow();
    });

    it('should not create project for non-existent user', async () => {
      const createProjectDto = {
        name: 'Test Project',
        created_by: 999
      };

      await expect(service.create(createProjectDto, 'non-existent-id'))
        .rejects.toThrow();
    });
  });

  afterEach(async () => {
    await projectRepository.query(`DELETE FROM projects`);
    await userRepository.query(`DELETE FROM users`);
  });
});
