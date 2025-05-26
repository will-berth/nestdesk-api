import { CreateUserDto } from "src/users/dto/create-user.dto";

export const USER_SERVICE = 'USER_SERVICE';

export interface IUserService {
    findByPublicId(public_id: string): Promise<any>;
    findBy(where: any): Promise<any[]>;
    findByEmail(email: string): Promise<any>;
    create(createUserDto: CreateUserDto): Promise<any>;
}
  