import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783770310683 implements MigrationInterface {
    name = 'Migration1783770310683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`number\` varchar(24) NOT NULL, \`quoteId\` int NULL, \`customerId\` int NOT NULL, \`status\` varchar(16) NOT NULL DEFAULT 'NEW', \`startDate\` date NULL, \`deadline\` date NULL, \`total\` decimal(12,2) NOT NULL DEFAULT '0.00', \`assignedToId\` int NULL, \`deletedAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_4e174e347d448617acdf98fef0\` (\`number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderId\` int NOT NULL, \`serviceId\` int NULL, \`description\` varchar(255) NOT NULL, \`qty\` decimal(12,3) NOT NULL DEFAULT '1.000', \`unit\` varchar(16) NOT NULL DEFAULT 'PIECE', \`lineTotal\` decimal(12,2) NOT NULL DEFAULT '0.00', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_533da3a3887638192a5dfa2c176\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_e5de51ca888d8b1f5ac25799dd1\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_e5de51ca888d8b1f5ac25799dd1\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_533da3a3887638192a5dfa2c176\``);
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
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_4e174e347d448617acdf98fef0\` ON \`orders\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
    }

}
