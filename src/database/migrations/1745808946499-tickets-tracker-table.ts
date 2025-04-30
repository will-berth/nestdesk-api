import { MigrationInterface, QueryRunner } from "typeorm";

export class TicketsTrackerTable1745807069866 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS 
                "tickets_tracker" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "changed_by" INTEGER NOT NULL, 
                    "ticket_id" INTEGER NOT NULL, 
                    "comment_id" INTEGER, 
                    "assigned_to" INTEGER NOT NULL, 
                    "status" TEXT NOT NULL, 
                    "priority" TEXT, 
                    "change_type" TEXT NOT NULL, 
                    "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    CONSTRAINT tickets_tracker_fk_changed_by FOREIGN KEY ("changed_by") REFERENCES "users"("id"),
                    CONSTRAINT tickets_tracker_fk_ticket_id FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id"),
                    CONSTRAINT tickets_tracker_fk_comment_id FOREIGN KEY ("comment_id") REFERENCES "tickets_comments"("id"),
                    CONSTRAINT tickets_tracker_fk_assigned_to FOREIGN KEY ("assigned_to") REFERENCES "users"("id")
                )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tickets_tracker"
        `)
    }

}