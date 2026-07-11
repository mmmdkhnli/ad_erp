import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783774229092 implements MigrationInterface {
    name = 'Migration1783774229092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`installations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` int NOT NULL, \`type\` varchar(16) NOT NULL DEFAULT 'MOUNT', \`address\` varchar(255) NOT NULL, \`mapUrl\` varchar(500) NULL, \`scheduledAt\` datetime NULL, \`status\` varchar(16) NOT NULL DEFAULT 'PLANNED', \`assigneeId\` int NULL, \`teamNote\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`taxId\` \`taxId\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`contactPerson\` \`contactPerson\` varchar(128) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`phone\` \`phone\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`email\` \`email\` varchar(190) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`address\` \`address\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`note\` \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`service_catalog\` CHANGE \`defaultPrice\` \`defaultPrice\` decimal(12,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`entityId\` \`entityId\` varchar(64) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`changes\` \`changes\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_533da3a3887638192a5dfa2c176\``);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`phone\` \`phone\` varchar(32) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`email\` \`email\` varchar(190) NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`note\` \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`customerId\` \`customerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`assignedToId\` \`assignedToId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`interactions\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`interactions\` CHANGE \`nextActionAt\` \`nextActionAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`validUntil\` \`validUntil\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`assignedToId\` \`assignedToId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`note\` \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`quote_items\` CHANGE \`serviceId\` \`serviceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`quoteId\` \`quoteId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`startDate\` \`startDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deadline\` \`deadline\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`assignedToId\` \`assignedToId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`serviceId\` \`serviceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` DROP FOREIGN KEY \`FK_32dfd1983de293befab641743d1\``);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`orderItemId\` \`orderItemId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`assigneeId\` \`assigneeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`machine\` \`machine\` varchar(16) NULL`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`deadline\` \`deadline\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`note\` \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`dueAt\` \`dueAt\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`note\` \`note\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`expenses\` CHANGE \`orderId\` \`orderId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`expenses\` CHANGE \`createdById\` \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`unitCost\` \`unitCost\` decimal(12,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`reason\` \`reason\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`orderId\` \`orderId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`createdById\` \`createdById\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_533da3a3887638192a5dfa2c176\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` ADD CONSTRAINT \`FK_32dfd1983de293befab641743d1\` FOREIGN KEY (\`assigneeId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`installations\` ADD CONSTRAINT \`FK_4c3ce088c5c87e91196b72485de\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`installations\` DROP FOREIGN KEY \`FK_4c3ce088c5c87e91196b72485de\``);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` DROP FOREIGN KEY \`FK_32dfd1983de293befab641743d1\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_533da3a3887638192a5dfa2c176\``);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`createdById\` \`createdById\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`orderId\` \`orderId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`reason\` \`reason\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`stock_movements\` CHANGE \`unitCost\` \`unitCost\` decimal(12,2) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`expenses\` CHANGE \`createdById\` \`createdById\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`expenses\` CHANGE \`orderId\` \`orderId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`payments\` CHANGE \`note\` \`note\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`invoices\` CHANGE \`dueAt\` \`dueAt\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`note\` \`note\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`deadline\` \`deadline\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`machine\` \`machine\` varchar(16) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`assigneeId\` \`assigneeId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` CHANGE \`orderItemId\` \`orderItemId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` ADD CONSTRAINT \`FK_32dfd1983de293befab641743d1\` FOREIGN KEY (\`assigneeId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`serviceId\` \`serviceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`assignedToId\` \`assignedToId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`deadline\` \`deadline\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`startDate\` \`startDate\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`quoteId\` \`quoteId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`quote_items\` CHANGE \`serviceId\` \`serviceId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`note\` \`note\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`assignedToId\` \`assignedToId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`quotes\` CHANGE \`validUntil\` \`validUntil\` date NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`interactions\` CHANGE \`nextActionAt\` \`nextActionAt\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`interactions\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`assignedToId\` \`assignedToId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`customerId\` \`customerId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`note\` \`note\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`email\` \`email\` varchar(190) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` CHANGE \`phone\` \`phone\` varchar(32) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_533da3a3887638192a5dfa2c176\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`changes\` \`changes\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`entityId\` \`entityId\` varchar(64) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`service_catalog\` CHANGE \`defaultPrice\` \`defaultPrice\` decimal(12,2) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`deletedAt\` \`deletedAt\` datetime(6) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`note\` \`note\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`address\` \`address\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`email\` \`email\` varchar(190) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`phone\` \`phone\` varchar(32) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`contactPerson\` \`contactPerson\` varchar(128) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`customers\` CHANGE \`taxId\` \`taxId\` varchar(32) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`DROP TABLE \`installations\``);
    }

}
