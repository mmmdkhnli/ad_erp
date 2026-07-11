import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeORM və mysql2 server tərəfdə xarici paket kimi qalır (bundle olunmur).
  // Bu, TypeORM-un dinamik require-ları və dekorator metadata-sı ilə problemin qarşısını alır.
  serverExternalPackages: ["typeorm", "mysql2"],
};

export default nextConfig;
