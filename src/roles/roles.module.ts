import { forwardRef, Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './models/role.entity';
import { UsersModule } from '../users/users.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    forwardRef(() => ProjectsModule),
    UsersModule,
    TypeOrmModule.forFeature([
      Role
    ]),
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
