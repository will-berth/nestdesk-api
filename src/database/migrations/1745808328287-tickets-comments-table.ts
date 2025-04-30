import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketsCommentsTable1745808328287 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS 
                "tickets_comments" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "public_id" TEXT NOT NULL, 
                    "ticket_id" INTEGER NOT NULL, 
                    "commented_by" INTEGER NOT NULL, 
                    "comment" TEXT NOT NULL, 
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    UNIQUE ("public_id"),
                    CONSTRAINT tickets_comments_fk_ticket_id FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id"),
                    CONSTRAINT tickets_comments_fk_commented_by FOREIGN KEY ("commented_by") REFERENCES "users"("id")
                )
                    
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tickets_comments"
        `)
    }

}
