import { AddUserToProjectDto } from "src/projects/dto/add-user-to-project.dto";
import { CreateProjectDto } from "src/projects/dto/create-project.dto";
import { Project } from "src/projects/models/project.entity";
import { ProjectUser } from "src/projects/models/project-user.entity";

export const PROJECT_SERVICE = 'PROJECT_SERVICE';

export interface IProjectService {
    create(createProjectDto: CreateProjectDto, userPublicId: string): Promise<Project>;
    findByPublicId(publicId: string): Promise<Project>;
    findByName(name: string): Promise<any>;
    addUser(addUserDto: AddUserToProjectDto): Promise<ProjectUser>;
    getUsers(projectId: string): Promise<ProjectUser[]>;
    findUserRolesByUserAndProject(projectPublicId: string, userPublicId: string): Promise<ProjectUser | null>;
}