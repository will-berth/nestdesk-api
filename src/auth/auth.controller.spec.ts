import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/models/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { configService } from '../config/config.service';
import { HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
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
      controllers: [AuthController],
      providers: [AuthService, UsersService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await userRepository.clear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
      };

      const result = await controller.signUp(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.name).toBe(createUserDto.name);
      expect(result.password).toBeUndefined();
    });

    it('should not create user with duplicate email', async () => {
      const createUserDto = {
        email: 'duplicatemail@example.com',
        password: 'Password123!',
        name: 'Test'
      };
      await controller.signUp(createUserDto);

      await expect(controller.signUp(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('signin', () => {
    it('should authenticate user and return token', async () => {
      const createUserDto = {
        email: 'signin@example.com',
        password: 'Password123!',
        name: 'Test'
      };

      await controller.signUp(createUserDto);

      const signInDto = {
        email: 'signin@example.com',
        password: 'Password123!'
      };

      const result = await controller.signIn(signInDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should not authenticate with wrong password', async () => {
      const createUserDto = {
        email: 'wrong@example.com',
        password: 'Password123!',
        name: 'Test',
      };

      await controller.signUp(createUserDto);

      const signInDto = {
        email: 'wrong@example.com',
        password: 'WrongPassword123!'
      };

      await expect(controller.signIn(signInDto)).rejects.toThrow();
    });

    it('should not authenticate non-existent user', async () => {
      const signInDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!'
      };

      await expect(controller.signIn(signInDto)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    await userRepository.clear();
  });
});
