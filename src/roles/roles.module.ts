import { forwardRef, Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './models/role.entity';
import { ROLE_SERVICE } from 'src/interfaces/role-service.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role
    ]),
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    {
      provide: ROLE_SERVICE,
      useClass: RolesService
    }
  ],
  exports: [ROLE_SERVICE]
})
export class RolesModule {}
