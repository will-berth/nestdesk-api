
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../common/decorators/roles.decorator';
import { IProjectService, PROJECT_SERVICE } from 'src/interfaces/project-service.interface';
import { IUserService, USER_SERVICE } from 'src/interfaces/user-service.interface';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(USER_SERVICE) private userService: IUserService,
        @Inject(PROJECT_SERVICE) private projectService: IProjectService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get(Roles, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const projectId = request.params.projectId;

        if (!roles) {
            return true;
        }

        const currentUserRole = await this.projectService.findUserRolesByUserAndProject(projectId, user.public_id);
        
        if(!currentUserRole){
            return await this.verifyOwner(projectId, user.public_id);
        }

        return this.matchRoles(roles, currentUserRole.role.name);
    }

    private async verifyOwner(projectPublicId: string, userPublicId: string): Promise<boolean> {
        let isOwner: boolean;

        const [userDb, projectDb] = await Promise.all([
            this.userService.findByPublicId(userPublicId),
            this.projectService.findByPublicId(projectPublicId)
        ]);

        isOwner = userDb.id === projectDb.created_by ? true : false;

        return isOwner;
    }

    private matchRoles(roles: string[], userRoles: string): boolean {
        return roles.some((role) => userRoles === role);
    }
}
