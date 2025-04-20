import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configService } from '../config/config.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await userRepository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(result.password).toBe(createUserDto.password);
      expect(result.public_id).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const createUserDto = {
        email: 'find@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await service.create(createUserDto);

      const result = await service.findByEmail(createUserDto.email);

      expect(result).toBeDefined();
      expect(result!.email).toBe(createUserDto.email);
    });

    it('should return null for non-existent email', async () => {
      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  afterAll(async () => {
    await userRepository.clear();
  });
});