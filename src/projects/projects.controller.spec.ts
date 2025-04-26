import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './models/project.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/models/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProjectUser } from './models/project-user.entity';
import { RolesModule } from '../roles/roles.module';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: ProjectsService;
    let projectRepository: Repository<Project>;
    let userRepository: Repository<User>;
    let projectUserRepository: Repository<ProjectUser>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
                TypeOrmModule.forFeature([Project, User, ProjectUser]),
                JwtModule.register({
                    global: true,
                    secret: configService.getJwtSecret(),
                    signOptions: { expiresIn: '1d' },
                }),
                UsersModule,
                RolesModule
            ],
            controllers: [ProjectsController],
            providers: [ProjectsService],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
        service = module.get<ProjectsService>(ProjectsService);
        projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        projectUserRepository = module.get<Repository<ProjectUser>>(getRepositoryToken(ProjectUser));

        // await projectRepository.query(`DELETE FROM projects`);
        // await userRepository.query(`DELETE FROM users`);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new project', async () => {
            const user = userRepository.create({
                email: 'newuserprojectcontroller@example.com',
                password: 'Password123!',
                name: 'Test User'
            });
            await userRepository.save(user);

            const createProjectDto = {
                name: 'Test Project',
                created_by: user.id
            };

            const req = {
                user: {
                    public_id: user.public_id
                }
            };

            const result = await controller.create(createProjectDto, req);

            expect(result).toBeDefined();
            expect(result.name).toBe(createProjectDto.name);
            expect(result.created_by).toBe(user.id);
            expect(result.public_id).toBeDefined();
            expect(result.created_at).toBeDefined();
            expect(result.updated_at).toBeDefined();
        });

        it('should not create project with duplicate name', async () => {
            const user = userRepository.create({
                email: 'newuserprojectcontroller2@example.com',
                password: 'Password123!',
                name: 'Test User 2'
            });
            await userRepository.save(user);

            const createProjectDto = {
                name: 'Duplicate Project',
                created_by: user.id
            };

            const req = {
                user: {
                    public_id: user.public_id
                }
            };

            await controller.create(createProjectDto, req);

            await expect(controller.create(createProjectDto, req))
                .rejects.toThrow();
        });

        it('should not create project with non-existent user', async () => {
            const createProjectDto = {
                name: 'Test Project',
                created_by: 999
            };

            const req = {
                user: {
                    public_id: 'non-existent-id'
                }
            };

            await expect(controller.create(createProjectDto, req))
                .rejects.toThrow();
        });
    });

    afterEach(async () => {
        await projectRepository.query(`DELETE FROM projects`);
        await userRepository.query(`DELETE FROM users`);
    });
});
