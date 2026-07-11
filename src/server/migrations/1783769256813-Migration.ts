import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783769256813 implements MigrationInterface {
    name = 'Migration1783769256813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`quotes\` (\`id\` int NOT NULL AUTO_INCREMENT, \`number\` varchar(24) NOT NULL, \`customerId\` int NOT NULL, \`version\` int NOT NULL DEFAULT '1', \`status\` varchar(16) NOT NULL DEFAULT 'DRAFT', \`validUntil\` date NULL, \`subtotal\` decimal(12,2) NOT NULL DEFAULT '0.00', \`marginAmount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`vatAmount\` decimal(12,2) NOT NULL DEFAULT '0.00', \`total\` decimal(12,2) NOT NULL DEFAULT '0.00', \`vatRate\` decimal(5,2) NOT NULL DEFAULT '18.00', \`assignedToId\` int NULL, \`note\` text NULL, \`deletedAt\` datetime(6) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_15ae60730d4562df625600005b\` (\`number\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`quote_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quoteId\` int NOT NULL, \`serviceId\` int NULL, \`description\` varchar(255) NOT NULL, \`qty\` decimal(12,3) NOT NULL DEFAULT '1.000', \`unit\` varchar(16) NOT NULL DEFAULT 'PIECE', \`materialCost\` decimal(12,2) NOT NULL DEFAULT '0.00', \`laborCost\` decimal(12,2) NOT NULL DEFAULT '0.00', \`transportCost\` decimal(12,2) NOT NULL DEFAULT '0.00', \`installCost\` decimal(12,2) NOT NULL DEFAULT '0.00', \`marginPct\` decimal(5,2) NOT NULL DEFAULT '0.00', \`lineTotal\` decimal(12,2) NOT NULL DEFAULT '0.00', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
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
        await queryRunner.query(`ALTER TABLE \`leads\` ADD CONSTRAINT \`FK_533da3a3887638192a5dfa2c176\` FOREIGN KEY (\`assignedToId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quotes\` ADD CONSTRAINT \`FK_ccf1feb9e280240bb05dc0aed2a\` FOREIGN KEY (\`customerId\`) REFERENCES \`customers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quote_items\` ADD CONSTRAINT \`FK_ef162674660b3ed9dc76de21160\` FOREIGN KEY (\`quoteId\`) REFERENCES \`quotes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`quote_items\` DROP FOREIGN KEY \`FK_ef162674660b3ed9dc76de21160\``);
        await queryRunner.query(`ALTER TABLE \`quotes\` DROP FOREIGN KEY \`FK_ccf1feb9e280240bb05dc0aed2a\``);
        await queryRunner.query(`ALTER TABLE \`leads\` DROP FOREIGN KEY \`FK_533da3a3887638192a5dfa2c176\``);
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
        await queryRunner.query(`DROP TABLE \`quote_items\``);
        await queryRunner.query(`DROP INDEX \`IDX_15ae60730d4562df625600005b\` ON \`quotes\``);
        await queryRunner.query(`DROP TABLE \`quotes\``);
    }

}
