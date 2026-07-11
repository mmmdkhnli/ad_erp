import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { Order } from "./Order";

/** Sifariş sətri (təklifdən kopyalanır). */
@Entity({ name: "order_items" })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  orderId!: number;

  @ManyToOne("Order", (o: Order) => o.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @Column({ type: "int", nullable: true })
  serviceId!: number | null;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 1 })
  qty!: string;

  @Column({ type: "varchar", length: 16, default: "PIECE" })
  unit!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  lineTotal!: string;
}
