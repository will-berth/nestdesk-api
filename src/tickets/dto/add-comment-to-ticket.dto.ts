import { IsString } from "class-validator";


export class AddCommentToTicketDto{
    @IsString()
    commented_by: string;
    
    @IsString()
    comment: string
}