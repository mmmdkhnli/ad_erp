import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

/** Müştəri (CRM). */
@Entity({ name: "customers" })
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 190 })
  name!: string;

  /** INDIVIDUAL | COMPANY */
  @Column({ type: "varchar", length: 16, default: "COMPANY" })
  type!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  taxId!: string | null;

  @Column({ type: "varchar", length: 128, nullable: true })
  contactPerson!: string | null;

  @Column({ type: "varchar", length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 190, nullable: true })
  email!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  address!: string | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
