import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/** Anbar hərəkəti (mədaxil / məxaric / düzəliş). */
@Entity({ name: "stock_movements" })
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  materialId!: number;

  /** IN | OUT | ADJUST */
  @Column({ type: "varchar", length: 8, default: "IN" })
  type!: string;

  @Column({ type: "decimal", precision: 12, scale: 3 })
  qty!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  unitCost!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  reason!: string | null;

  @Column({ type: "int", nullable: true })
  orderId!: number | null;

  @Column({ type: "int", nullable: true })
  createdById!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
