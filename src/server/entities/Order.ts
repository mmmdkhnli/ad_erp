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
import type { OrderItem } from "./OrderItem";
import type { Customer } from "./Customer";

/** Sifariş (job bag) — təsdiqlənmiş təklifdən yaranır. */
@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  /** ORD-YYYY-NNNN */
  @Column({ type: "varchar", length: 24, unique: true })
  number!: string;

  @Column({ type: "int", nullable: true })
  quoteId!: number | null;

  @Column({ type: "int" })
  customerId!: number;

  @ManyToOne("customers", { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer!: Customer | null;

  /** NEW | IN_PROGRESS | INSTALLING | DELIVERED | CLOSED | CANCELLED */
  @Column({ type: "varchar", length: 16, default: "NEW" })
  status!: string;

  @Column({ type: "date", nullable: true })
  startDate!: string | null;

  @Column({ type: "date", nullable: true })
  deadline!: string | null;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ type: "int", nullable: true })
  assignedToId!: number | null;

  @OneToMany("order_items", (item: OrderItem) => item.order)
  items!: OrderItem[];

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
