import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    findAll() {
        return this.roleService.findAll();
    }
}
