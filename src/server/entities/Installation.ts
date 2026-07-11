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

/** Quraşdırma / montaj tapşırığı. */
@Entity({ name: "installations" })
export class Installation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  orderId!: number;

  @ManyToOne("orders", { nullable: true })
  @JoinColumn({ name: "orderId" })
  order!: Order | null;

  /** MOUNT | DISMOUNT | SERVICE */
  @Column({ type: "varchar", length: 16, default: "MOUNT" })
  type!: string;

  @Column({ type: "varchar", length: 255 })
  address!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  mapUrl!: string | null;

  @Column({ type: "datetime", nullable: true })
  scheduledAt!: Date | null;

  /** PLANNED | EN_ROUTE | IN_PROGRESS | DONE */
  @Column({ type: "varchar", length: 16, default: "PLANNED" })
  status!: string;

  @Column({ type: "int", nullable: true })
  assigneeId!: number | null;

  @Column({ type: "text", nullable: true })
  teamNote!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
