import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

  async create(createUserDto: CreateUserDto) {
    const userDb = await this.findByEmail(createUserDto.email);
    if (userDb) {
      throw new HttpException({
        message: 'User already exists',
        code: 'USER_ALREADY_EXISTS',
      }, HttpStatus.CONFLICT);
    }
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByPublicId(public_id: string) {
    const user = await this.userRepository.findOne({ where: { public_id } });

    if (!user) throw new HttpException({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    }, HttpStatus.CONFLICT);

    return user;
  }

  async findOneOrFail(where: any): Promise<User> {
    const user = await this.userRepository.findOneOrFail({ where });
    if (!user) throw new HttpException({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    }, HttpStatus.CONFLICT);
    return user;
  }

  async findBy(where: any): Promise<User[]> {
    const users = await this.userRepository.findBy(where);
    // if(!user) throw new HttpException('User not found', HttpStatus.CONFLICT);
    return users;
  }
}
