import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { SignInDto } from './dto/sign-in-dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async signUp(createUserDto: CreateUserDto) {
        const user = await this.usersService.findByEmail(createUserDto.email);
        if (user){
            throw new HttpException('User already exists', HttpStatus.CONFLICT);
        }
        const hash = await bcrypt.hash(createUserDto.password, 10);
        const userSaved = await this.usersService.create({...createUserDto, password: hash}); 
        const userPlain = instanceToPlain(userSaved);
        return {
            ... userPlain as CreateUserDto,
            token: this.jwtService.sign(userPlain)
        }
    }

    async signIn(userDto: SignInDto) {
        const user = await this.usersService.findByEmail(userDto.email);
        if (!user){
            throw new HttpException('User does not exists', HttpStatus.CONFLICT);
        }

        const match = await bcrypt.compare(userDto.password, user.password);
        if (!match){
            throw new HttpException('Password is not valid', HttpStatus.CONFLICT);
        }
        const userPlain = instanceToPlain(user);
        return {
            ... userPlain as CreateUserDto,
            token: this.jwtService.sign(userPlain)
        }
    }
}
