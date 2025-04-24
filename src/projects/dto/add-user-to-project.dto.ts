import { IsString } from "class-validator";


export class AddUserToProjectDto {
    @IsString()
    user_id: string;
    @IsString()
    role_id: string;
    @IsString()
    project_id: string;
}