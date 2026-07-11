import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Order } from "./Order";

/** Faktura. */
@Entity({ name: "invoices" })
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  /** INV-YYYY-NNNN */
  @Column({ type: "varchar", length: 24, unique: true })
  number!: string;

  @Column({ type: "int" })
  orderId!: number;

  @ManyToOne("Order", { nullable: true })
  @JoinColumn({ name: "orderId" })
  order!: Order | null;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  amount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  vatAmount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  total!: string;

  /** UNPAID | PARTIAL | PAID */
  @Column({ type: "varchar", length: 16, default: "UNPAID" })
  status!: string;

  @Column({ type: "date" })
  issuedAt!: string;

  @Column({ type: "date", nullable: true })
  dueAt!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
