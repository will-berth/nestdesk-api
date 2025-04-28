import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketsTable1745787111511 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS 
                "tickets" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "public_id" TEXT NOT NULL, 
                    "created_by" INTEGER NOT NULL, 
                    "project_id" INTEGER NOT NULL, 
                    "assigned_to" INTEGER NOT NULL, 
                    "name" TEXT NOT NULL, 
                    "description" TEXT NOT NULL, 
                    "status" TEXT NOT NULL DEFAULT 'todo', 
                    "priority" TEXT, 
                    "deleted" BOOLEAN NOT NULL DEFAULT false, 
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    UNIQUE ("public_id"),
                    CONSTRAINT tickets_fk_created_by FOREIGN KEY ("created_by") REFERENCES "users"("id"),
                    CONSTRAINT tickets_fk_project_id FOREIGN KEY ("project_id") REFERENCES "projects"("id"),
                    CONSTRAINT tickets_fk_assigned_to FOREIGN KEY ("assigned_to") REFERENCES "users"("id")
                )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tickets"
        `)
    }

}
