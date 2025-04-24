import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './models/role.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role
    ])
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard
    // }
  ],
  exports: [RolesService]
})
export class RolesModule {}
