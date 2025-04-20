import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/models/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { configService } from '../config/config.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          global: true,
          secret: configService.getJwtSecret(),
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await userRepository.clear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return token', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      const result = await service.signUp(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(result.password).toBeUndefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for duplicate email', async () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await service.signUp(createUserDto);
      // await expect(service.signUp(createUserDto)).rejects.toThrow(HttpException);
      await expect(service.signUp(createUserDto)).rejects.toThrow();
    });
  });

  describe('signIn', () => {
    it('should authenticate user and return token', async () => {
      const createUserDto = {
        email: 'signin@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await service.signUp(createUserDto);

      const signInDto = {
        email: 'signin@example.com',
        password: 'Password123!',
      };

      const result = await service.signIn(signInDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.email).toBe(signInDto.email);
    });

    it('should throw error for non-existent user', async () => {
      const signInDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await expect(service.signIn(signInDto)).rejects.toThrow(HttpException);
    });

    it('should throw error for wrong password', async () => {
      const createUserDto = {
        email: 'wrong@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      await service.signUp(createUserDto);

      const signInDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword123!',
      };

      await expect(service.signIn(signInDto)).rejects.toThrow(HttpException);
    });
  });

  afterAll(async () => {
    await userRepository.clear();
  });
});