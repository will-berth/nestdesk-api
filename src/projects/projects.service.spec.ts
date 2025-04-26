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
import { Role } from '../roles/models/role.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let usersService: UsersService;
  let projectRepository: Repository<Project>;
  let userRepository: Repository<User>;
  let projectUserRepository: Repository<ProjectUser>;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([Project, User, ProjectUser, Role]),
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
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
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

  describe('addUserToProject', () => {
    it('should add user to project', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'userforprojectprojectservice@example.com',
          password: 'Password123!',
          name: 'Project User'
        })
      );

      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Test Project for User',
          created_by: user.id
        })
      );

      const role = await roleRepository.findOneOrFail({ where: { name: 'project_admin' } });

      const addUserDto = {
        user_id: user.public_id,
        role_id: role.public_id,
        project_id: project.public_id
      };

      const result = await service.addUser(addUserDto);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(user.id);
      expect(result.project_id).toBe(project.id);
      expect(result.role_id).toBe(role.id);
      expect(result.public_id).toBeDefined();
      expect(result.joined_at).toBeDefined();
    });

    it('should not add user to project twice', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'duplicateuserprojectservice@example.com',
          password: 'Password123!',
          name: 'Duplicate User'
        })
      );

      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Test Project Duplicate',
          created_by: user.id
        })
      );

      const role = await roleRepository.findOneOrFail({ where: { name: 'project_admin' } });

      const addUserDto = {
        user_id: user.public_id,
        role_id: role.public_id,
        project_id: project.public_id
      };

      await service.addUser(addUserDto);

      await expect(service.addUser(addUserDto))
        .rejects.toThrow(HttpException);
    });

    it('should throw error for non-existent project', async () => {
      const addUserDto = {
        user_id: 'some-user-id',
        role_id: 'some-role-id',
        project_id: 'non-existent-project-id'
      };

      await expect(service.addUser(addUserDto))
        .rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should get all users from a project', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'getusersprojectservice@example.com',
          password: 'Password123!',
          name: 'Get Users Test'
        })
      );

      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Test Project Get Users',
          created_by: user.id
        })
      );

      const role = await roleRepository.findOneOrFail({ where: { name: 'project_admin' } });

      await projectUserRepository.save(
        projectUserRepository.create({
          user_id: user.id,
          project_id: project.id,
          role_id: role.id
        })
      );

      const result = await service.getUsers(project.public_id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].user_id).toBe(user.id);
      expect(result[0].project_id).toBe(project.id);
      expect(result[0].role_id).toBe(role.id);
      expect(result[0].user).toBeDefined();
      expect(result[0].role).toBeDefined();
    });

    it('should return empty array for project with no users', async () => {
      const user = await userRepository.save(
        userRepository.create({
          email: 'emptyusersprojectservice@example.com',
          password: 'Password123!',
          name: 'Get Users Test'
        })
      );
      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Empty Project',
          created_by: user.id
        })
      );

      const result = await service.getUsers(project.public_id);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should throw error for non-existent project', async () => {
      await expect(service.getUsers('non-existent-project-id'))
        .rejects.toThrow();
    });
  });

  afterAll(async () => {
    await projectUserRepository.query(`DELETE FROM project_user`);
    await projectRepository.query(`DELETE FROM projects`);
    await userRepository.query(`DELETE FROM users`);
  });
});
