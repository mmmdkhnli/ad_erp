import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import type { User } from "./User";

/** İstifadəçi rolu + icazə açarları (RBAC). */
@Entity({ name: "roles" })
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  /** ADMIN | SALES | PRODUCTION | FINANCE | DESIGNER | INSTALLER | WAREHOUSE */
  @Column({ type: "varchar", length: 32, unique: true })
  name!: string;

  /** UI-da göstərilən Azərbaycan etiketi. */
  @Column({ type: "varchar", length: 128 })
  label!: string;

  /** İcazə açarları massivi, məs. ["quotes:write", "finance:read"] və ya ["*"]. */
  @Column({ type: "simple-json" })
  permissions!: string[];

  @OneToMany("User", (user: User) => user.role)
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
