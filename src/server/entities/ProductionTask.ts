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
import type { User } from "./User";

/** İstehsalat tapşırığı (Kanban kartı). */
@Entity({ name: "production_tasks" })
export class ProductionTask {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  orderId!: number;

  @ManyToOne("orders", { nullable: true })
  @JoinColumn({ name: "orderId" })
  order!: Order | null;

  @Column({ type: "int", nullable: true })
  orderItemId!: number | null;

  @Column({ type: "varchar", length: 190 })
  title!: string;

  /** PENDING | DESIGN | PRODUCTION | QC | DONE */
  @Column({ type: "varchar", length: 16, default: "PENDING" })
  stage!: string;

  @Column({ type: "int", nullable: true })
  assigneeId!: number | null;

  @ManyToOne("users", { nullable: true })
  @JoinColumn({ name: "assigneeId" })
  assignee!: User | null;

  /** ROLAND | MIMAKI | CNC | LASER | MANUAL */
  @Column({ type: "varchar", length: 16, nullable: true })
  machine!: string | null;

  @Column({ type: "date", nullable: true })
  deadline!: string | null;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @Column({ type: "int", default: 0 })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
