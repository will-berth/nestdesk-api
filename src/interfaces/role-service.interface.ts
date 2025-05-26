import { Role } from "src/roles/models/role.entity";

export const ROLE_SERVICE = 'ROLE_SERVICE';

export interface IRoleService {
    findAll(): Promise<Role[]>;
    findByPublicId(publicId: string): Promise<Role>;
    // findByName(name: string): Promise<Role>;
}