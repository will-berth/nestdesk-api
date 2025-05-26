import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { SignInDto } from './dto/sign-in-dto';
import { IUserService, USER_SERVICE } from 'src/interfaces/user-service.interface';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_SERVICE) private readonly usersService: IUserService,
        private jwtService: JwtService
    ) { }

    async signUp(createUserDto: CreateUserDto) {
        const user = await this.usersService.findByEmail(createUserDto.email);
        if (user) {
            throw new HttpException({
                message: 'User already exists',
                code: 'USER_ALREADY_EXISTS',
            }, HttpStatus.CONFLICT);
        }
        const hash = await bcrypt.hash(createUserDto.password, 10);
        const userSaved = await this.usersService.create({ ...createUserDto, password: hash });
        const userPlain = instanceToPlain(userSaved);
        return {
            ...userPlain as CreateUserDto,
            token: this.jwtService.sign(userPlain)
        }
    }

    async signIn(userDto: SignInDto) {
        const user = await this.usersService.findByEmail(userDto.email);
        if (!user) {
            throw new HttpException({
                message: 'User does not exist',
                code: 'USER_NOT_EXISTS',
            }, HttpStatus.CONFLICT);
        }

        const match = await bcrypt.compare(userDto.password, user.password);
        if (!match) {
            throw new HttpException({
                message: 'Password is not valid',
                code: 'PASSWORD_NOT_VALID',
            }, HttpStatus.CONFLICT);
        }
        const userPlain = instanceToPlain(user);
        return {
            ...userPlain as CreateUserDto,
            token: this.jwtService.sign(userPlain)
        }
    }
}
