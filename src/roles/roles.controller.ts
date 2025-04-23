import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(AuthGuard)
    findAll() {
        return this.roleService.findAll();
    }
}
