import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import type { User } from "./User";

/** Potensial müştəri (lead). */
@Entity({ name: "leads" })
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 190 })
  name!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 190, nullable: true })
  email!: string | null;

  /** REFERRAL | WEBSITE | CALL | EXHIBITION | OTHER */
  @Column({ type: "varchar", length: 16, default: "OTHER" })
  source!: string;

  /** NEW | CONTACTED | QUOTED | WON | LOST */
  @Column({ type: "varchar", length: 16, default: "NEW" })
  status!: string;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  /** Çevriləndə bağlanan müştəri (id). */
  @Column({ type: "int", nullable: true })
  customerId!: number | null;

  @ManyToOne("users", { nullable: true })
  @JoinColumn({ name: "assignedToId" })
  assignedTo!: User | null;

  @Column({ type: "int", nullable: true })
  assignedToId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
