import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

/** Şirkət parametrləri (tək sətir, id=1). */
@Entity({ name: "company_settings" })
export class CompanySettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 190, default: "AdErp" })
  name!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  taxId!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  logoUrl!: string | null;

  @Column({ type: "text", nullable: true })
  invoiceInfo!: string | null;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 18 })
  vatRate!: string;

  @Column({ type: "varchar", length: 8, default: "AZN" })
  currency!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
