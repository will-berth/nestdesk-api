import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    UsersModule, 
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()), AuthModule, ProjectsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
