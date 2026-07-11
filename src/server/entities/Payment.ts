import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/** Faktura üzrə ödəniş. */
@Entity({ name: "payments" })
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  invoiceId!: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: string;

  /** CASH | TRANSFER */
  @Column({ type: "varchar", length: 16, default: "TRANSFER" })
  method!: string;

  @Column({ type: "date" })
  paidAt!: string;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
