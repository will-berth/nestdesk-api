import { IsNumber, IsString } from "class-validator";


export class CreateProjectDto {
    @IsNumber()
    created_by: number;
    @IsString()
    name: string;
}