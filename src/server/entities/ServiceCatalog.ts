import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/** Xidmət / məhsul kataloqu (təkliflərdə istifadə olunur). */
@Entity({ name: "service_catalog" })
export class ServiceCatalog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 190 })
  name!: string;

  /** OUTDOOR | PRINTING | VEHICLE | DISPLAY | POS | CUTTING | DESIGN | INSTALLATION */
  @Column({ type: "varchar", length: 24 })
  category!: string;

  /** M2 | METER | PIECE | KG | SERVICE */
  @Column({ type: "varchar", length: 16 })
  unit!: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  defaultPrice!: string | null;

  /** Standart marja (%) */
  @Column({ type: "decimal", precision: 5, scale: 2, default: 30 })
  defaultMargin!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
