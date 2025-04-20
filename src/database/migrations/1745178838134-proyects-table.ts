import { MigrationInterface, QueryRunner } from "typeorm";

export class ProyectsTable1745178838134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS
                "projects" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "public_id" TEXT NOT NULL, 
                    "created_by" INTEGER NOT NULL, 
                    "name" TEXT NOT NULL, 
                    "deleted" BOOLEAN NOT NULL DEFAULT false, 
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    UNIQUE ("public_id", "name"),
                    CONSTRAINT proyects_fk_created_by FOREIGN KEY ("created_by") REFERENCES "users"("id")
                )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "projects"
        `)
    }

}
