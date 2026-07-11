import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../server/data-source";
import { User } from "../server/entities/User";
import { signSession, verifySession } from "../lib/session";

async function main() {
  const email = process.argv[2] ?? "admin@admedia.az";
  const ds = await AppDataSource.initialize();
  const user = await ds.getRepository(User).findOne({
    where: { email },
    relations: { role: true },
  });
  if (!user) throw new Error(`istifadəçi tapılmadı: ${email}`);

  console.log("user:", user.email, "| role:", user.role.name);
  console.log("pw correct (demo1234):", await bcrypt.compare("demo1234", user.passwordHash));
  console.log("pw wrong:", await bcrypt.compare("wrong", user.passwordHash));

  const token = await signSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions,
  });
  const back = await verifySession(token);
  console.log("session roundtrip:", back?.email, "| perms:", JSON.stringify(back?.permissions));
  console.log("TOKEN:" + token);

  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
