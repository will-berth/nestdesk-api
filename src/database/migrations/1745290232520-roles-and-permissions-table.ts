import { MigrationInterface, QueryRunner } from "typeorm";

export class RolesAndPermissionsTable1745290232520 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" SERIAL NOT NULL PRIMARY KEY, 
                "public_id" TEXT NOT NULL, 
                "name" TEXT NOT NULL, 
                "label" TEXT NOT NULL, 
                UNIQUE ("public_id", "name")
            );

            CREATE TABLE IF NOT EXISTS "permissions" (
                "id" SERIAL NOT NULL PRIMARY KEY, 
                "public_id" TEXT NOT NULL, 
                "action" TEXT NOT NULL, 
                "description" TEXT NOT NULL, 
                UNIQUE ("public_id", "action")
            );

            CREATE TABLE IF NOT EXISTS "role_permissions" (
                "id" SERIAL NOT NULL PRIMARY KEY, 
                "role_id" INT NOT NULL, 
                "permission_id" INT NOT NULL,
                CONSTRAINT role_permissions_fk_role FOREIGN KEY ("role_id") REFERENCES "roles"("id"),
                CONSTRAINT role_permissions_fk_permission FOREIGN KEY ("permission_id") REFERENCES "permissions"("id")
            );
                
            INSERT INTO "roles" ("public_id", "name", "label") 
            VALUES (uuid_generate_v4(), 'super_admin', 'Administrador Global'),
            (uuid_generate_v4(), 'project_admin', 'Administrador de Proyecto'),
            (uuid_generate_v4(), 'agent', 'Agente'),
            (uuid_generate_v4(), 'reporter', 'Reportero'),
            (uuid_generate_v4(), 'viewer', 'Visualizador');

            INSERT INTO "permissions" ("public_id", "action", "description") 
            VALUES (uuid_generate_v4(), 'create_users', 'Permite crear nuevos usuarios en el sistema.'),
            (uuid_generate_v4(), 'manage_projects', 'Permite crear, editar o eliminar proyectos.'),
            (uuid_generate_v4(), 'assign_users_to_projects', 'Permite asignar usuarios a uno o más proyectos.'),
            (uuid_generate_v4(), 'create_tickets', 'Permite crear nuevos tickets dentro de un proyecto.'),
            (uuid_generate_v4(), 'comment_tickets', 'Permite comentar en los tickets existentes.'),
            (uuid_generate_v4(), 'change_ticket_status', 'Permite cambiar el estado de un ticket.'),
            (uuid_generate_v4(), 'view_all_tickets', 'Permite ver todos los tickets del sistema.'),
            (uuid_generate_v4(), 'view_project_tickets', 'Permite ver todos los tickets de un proyecto asignado.'),
            (uuid_generate_v4(), 'configure_workflow', 'Permite configurar los estados y prioridades de los tickets.'),
            (uuid_generate_v4(), 'delete_tickets', 'Permite eliminar tickets.');

            -- super_admin (role_id = 1)
            INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
            (1, 1), -- create_users
            (1, 2), -- manage_projects
            (1, 3), -- assign_users_to_projects
            (1, 4), -- create_tickets
            (1, 5), -- comment_tickets
            (1, 6), -- change_ticket_status
            (1, 7), -- view_all_tickets
            (1, 8), -- view_project_tickets
            (1, 9), -- configure_ticket_workflow
            (1, 10); -- delete_tickets

            -- project_admin (role_id = 2)
            INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
            (2, 3), -- assign_users_to_projects
            (2, 4), -- create_tickets
            (2, 5), -- comment_tickets
            (2, 6), -- change_ticket_status
            (2, 8), -- view_project_tickets
            (2, 9), -- configure_ticket_workflow
            (2, 10); -- delete_tickets

            -- agent (role_id = 3)
            INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
            (3, 4), -- create_tickets
            (3, 5), -- comment_tickets
            (3, 6), -- change_ticket_status
            (3, 8); -- view_project_tickets

            -- reporter (role_id = 4)
            INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
            (4, 4), -- create_tickets
            (4, 5), -- comment_tickets
            (4, 8); -- view_project_tickets

            -- viewer (role_id = 5)
            INSERT INTO "role_permissions" ("role_id", "permission_id") VALUES
            (5, 8); -- view_project_tickets

        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "role_permissions";
            DROP TABLE "permissions";
            DROP TABLE "roles";
        `)
    }

}
