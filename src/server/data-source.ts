import "reflect-metadata";
import { DataSource } from "typeorm";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { Customer } from "./entities/Customer";
import { ServiceCatalog } from "./entities/ServiceCatalog";
import { AuditLog } from "./entities/AuditLog";
import { Lead } from "./entities/Lead";
import { Interaction } from "./entities/Interaction";
import { Quote } from "./entities/Quote";
import { QuoteItem } from "./entities/QuoteItem";
import { Order } from "./entities/Order";
import { OrderItem } from "./entities/OrderItem";
import { ProductionTask } from "./entities/ProductionTask";
import { Invoice } from "./entities/Invoice";
import { Payment } from "./entities/Payment";
import { Expense } from "./entities/Expense";
import { Material } from "./entities/Material";
import { StockMovement } from "./entities/StockMovement";
import { Installation } from "./entities/Installation";
import { CompanySettings } from "./entities/CompanySettings";

/**
 * TypeORM DataSource — tək export (CLI tələbi).
 * XAMPP default-ları ilə işləyir; .env varsa üstələyir.
 * Next runtime `getDataSource()` (db.ts) vasitəsilə istifadə edir.
 */
// Migrasiya glob-u yalnız CLI (tsx) üçün. Next runtime (NEXT_RUNTIME təyin olunur)
// glob require etməyə çalışsa interop qırılır — ona görə orada boş massiv.
const isNextRuntime = Boolean(process.env.NEXT_RUNTIME);

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "admedia_erp",
  charset: "utf8mb4",
  synchronize: false,
  logging: false,
  entities: [
    Role,
    User,
    Customer,
    ServiceCatalog,
    AuditLog,
    Lead,
    Interaction,
    Quote,
    QuoteItem,
    Order,
    OrderItem,
    ProductionTask,
    Invoice,
    Payment,
    Expense,
    Material,
    StockMovement,
    Installation,
    CompanySettings,
  ],
  migrations: isNextRuntime ? [] : ["src/server/migrations/*.ts"],
});
