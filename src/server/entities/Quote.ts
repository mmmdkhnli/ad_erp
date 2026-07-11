import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { QuoteItem } from "./QuoteItem";
import type { Customer } from "./Customer";

/** Kommersial təklif. */
@Entity({ name: "quotes" })
export class Quote {
  @PrimaryGeneratedColumn()
  id!: number;

  /** QUO-YYYY-NNNN */
  @Column({ type: "varchar", length: 24, unique: true })
  number!: string;

  @Column({ type: "int" })
  customerId!: number;

  @ManyToOne("Customer", { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer!: Customer | null;

  @Column({ type: "int", default: 1 })
  version!: number;

  /** DRAFT | SENT | APPROVED | REJECTED | EXPIRED */
  @Column({ type: "varchar", length: 16, default: "DRAFT" })
  status!: string;

  @Column({ type: "date", nullable: true })
  validUntil!: string | null;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  marginAmount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  vatAmount!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 18 })
  vatRate!: string;

  @Column({ type: "int", nullable: true })
  assignedToId!: number | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @OneToMany("QuoteItem", (item: QuoteItem) => item.quote)
  items!: QuoteItem[];

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
