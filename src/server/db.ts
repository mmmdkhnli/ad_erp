import "reflect-metadata";
import type { DataSource } from "typeorm";
import { AppDataSource } from "./data-source";

/**
 * Next.js üçün singleton DataSource.
 * Dev hot-reload zamanı təkrar initialize olmamaq üçün globalThis-də keşlənir.
 */
const globalForDs = globalThis as unknown as {
  __aderpDataSource?: DataSource;
};

export async function getDataSource(): Promise<DataSource> {
  const ds = globalForDs.__aderpDataSource ?? AppDataSource;
  if (!ds.isInitialized) {
    await ds.initialize();
  }
  globalForDs.__aderpDataSource = ds;
  return ds;
}
