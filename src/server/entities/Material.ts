import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/** Anbar materialı. */
@Entity({ name: "materials" })
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 190 })
  name!: string;

  /** M2 | METER | PIECE | KG | ROLL */
  @Column({ type: "varchar", length: 16, default: "PIECE" })
  unit!: string;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  stockQty!: string;

  @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
  minQty!: string;

  /** Orta maya (₼). */
  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  avgCost!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
