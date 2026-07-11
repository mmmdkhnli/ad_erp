import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Quote } from "./Quote";

/** Təklif sətri (5-komponentli xərc + marja). */
@Entity({ name: "quote_items" })
export class QuoteItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  quoteId!: number;

  @ManyToOne("quotes", (q: Quote) => q.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quoteId" })
  quote!: Quote;

  @Column({ type: "int", nullable: true })
  serviceId!: number | null;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 1 })
  qty!: string;

  @Column({ type: "varchar", length: 16, default: "PIECE" })
  unit!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  materialCost!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  laborCost!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  transportCost!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  installCost!: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  marginPct!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  lineTotal!: string;
}
