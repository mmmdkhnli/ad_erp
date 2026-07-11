import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/** Xərc (sifarişə bağlı və ya ümumi). */
@Entity({ name: "expenses" })
export class Expense {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  orderId!: number | null;

  /** MATERIAL | LABOR | TRANSPORT | RENT | OTHER */
  @Column({ type: "varchar", length: 16, default: "OTHER" })
  category!: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ type: "date" })
  spentAt!: string;

  @Column({ type: "int", nullable: true })
  createdById!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
