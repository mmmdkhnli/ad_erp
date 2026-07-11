import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/** Müştəri ilə əlaqə qeydi (zəng/görüş/email). */
@Entity({ name: "interactions" })
export class Interaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  customerId!: number;

  @Column({ type: "int", nullable: true })
  userId!: number | null;

  /** CALL | MEETING | EMAIL */
  @Column({ type: "varchar", length: 16, default: "CALL" })
  type!: string;

  @Column({ type: "text" })
  summary!: string;

  @Column({ type: "datetime", nullable: true })
  nextActionAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
