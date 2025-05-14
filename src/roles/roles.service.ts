import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './models/role.entity';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {}

    async findAll() {
        return await this.roleRepository.find({
            order: {
                id: 'ASC'
            }
        });
    }

    async findByPublicId(public_id: string): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { public_id } });
        if (!role) throw new HttpException({
            message: 'Role not found',
            code: 'ROLE_NOT_FOUND',
        }, HttpStatus.CONFLICT);
        return role;
    }
}
