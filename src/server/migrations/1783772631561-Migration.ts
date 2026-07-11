import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783772631561 implements MigrationInterface {
    name = 'Migration1783772631561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`invoices\` (\`id\` int NOT NULL AUTO_INCREMENT, \`number\` varchar(24) NOT NULL, \`orderId\` int NOT NULL, \`amount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`vatAmount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`total\` decimal(12,2) NOT NULL DEFAULT '0.00', \`status\` varchar(16) NOT NULL DEFAULT 'UNPAID', \`issuedAt\` date NOT NULL, \`dueAt\` date NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_6b20aa66f2a835a4f2fbde4872\` (\`number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`invoiceId\` int NOT NULL, \`amount\` decimal(12,2) NOT NULL, \`method\` varchar(16) NOT NULL DEFAULT 'TRANSFER', \`paidAt\` date NOT NULL, \`note\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`expenses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` int NULL, \`category\` varchar(16) NOT NULL DEFAULT 'OTHER', \`amount\` decimal(12,2) NOT NULL, \`description\` varchar(255) NOT NULL, \`spentAt\` date NOT NULL, \`createdById\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_533da3a3887638192a5dfa2c176\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` ADD CONSTRAINT \`FK_32dfd1983de293befab641743d1\` FOREIGN KEY (\`assigneeId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`invoices\` ADD CONSTRAINT \`FK_a58a78a0e0031dd93a2f56f1e8e\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invoices\` DROP FOREIGN KEY \`FK_a58a78a0e0031dd93a2f56f1e8e\``);
        await queryRunner.query(`ALTER TABLE \`production_tasks\` DROP FOREIGN KEY \`FK_32dfd1983de293befab641743d1\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_533da3a3887638192a5dfa2c176\``);
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
        await queryRunner.query(`DROP TABLE \`expenses\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP INDEX \`IDX_6b20aa66f2a835a4f2fbde4872\` ON \`invoices\``);
        await queryRunner.query(`DROP TABLE \`invoices\``);
    }

}
