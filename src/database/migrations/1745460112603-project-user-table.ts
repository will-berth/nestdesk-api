import { MigrationInterface, QueryRunner } from "typeorm";

export class ProjectUserTable1745460112603 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS
                "project_user" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "public_id" TEXT NOT NULL, 
                    "user_id" INTEGER NOT NULL, 
                    "project_id" INTEGER NOT NULL, 
                    "role_id" INTEGER NOT NULL, 
                    "deleted" BOOLEAN NOT NULL DEFAULT false, 
                    "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),  
                    UNIQUE ("user_id", "project_id"),
                    CONSTRAINT proyects_fk_user_id FOREIGN KEY ("user_id") REFERENCES "users"("id"),
                    CONSTRAINT proyects_fk_project_id FOREIGN KEY ("project_id") REFERENCES "projects"("id"),
                    CONSTRAINT proyects_fk_role_id FOREIGN KEY ("role_id") REFERENCES "roles"("id")
                )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "project_user"
        `)
    }

}
