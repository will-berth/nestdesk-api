import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersSchema1744944536158 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS
                "users" (
                    "id" SERIAL NOT NULL PRIMARY KEY, 
                    "public_id" TEXT NOT NULL, 
                    "name" TEXT NOT NULL, 
                    "email" TEXT NOT NULL, 
                    "password" TEXT NOT NULL, 
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                    UNIQUE ("public_id", "email")
                )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "users"
        `)
    }

}
