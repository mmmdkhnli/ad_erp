import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/** Kritik mutasiyaların audit qeydi. */
@Entity({ name: "audit_logs" })
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  userId!: number | null;

  /** Hansı entity, məs. "Quote", "Order". */
  @Column({ type: "varchar", length: 64 })
  entityType!: string;

  @Column({ type: "varchar", length: 64, nullable: true })
  entityId!: string | null;

  /** CREATE | UPDATE | DELETE | STATUS_CHANGE | LOGIN ... */
  @Column({ type: "varchar", length: 48 })
  action!: string;

  @Column({ type: "simple-json", nullable: true })
  changes!: unknown;

  @CreateDateColumn()
  createdAt!: Date;
}
