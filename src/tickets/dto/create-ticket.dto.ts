import { IsString } from "class-validator";


export class CreateTicketDto {
    @IsString()
    created_by: string;
    
    @IsString()
    project_id: string;
    
    @IsString()
    assigned_to: string;
    
    @IsString()
    name: string;
    
    @IsString()
    description: string;
    
    @IsString()
    priority: string;
}