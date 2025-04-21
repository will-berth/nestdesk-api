import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configService } from '../config/config.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([User]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // await userRepository.clear();
    // await userRepository.query(`DELETE FROM users`);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'createuserusercontroller@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = await controller.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(result.password).toBeDefined();
      expect(result.public_id).toBeDefined();
      expect(result.created_at).toBeDefined();
      expect(result.updated_at).toBeDefined();
    });

    it('should not create user with duplicate email', async () => {
      const createUserDto = {
        email: 'duplicateuserusercontroller@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await controller.create(createUserDto);
      await expect(controller.create(createUserDto)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    // await userRepository.clear();
    await userRepository.query(`DELETE FROM users`);
  });
});