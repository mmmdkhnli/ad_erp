import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../server/data-source";
import { Role } from "../server/entities/Role";
import { User } from "../server/entities/User";
import { Customer } from "../server/entities/Customer";
import { ServiceCatalog } from "../server/entities/ServiceCatalog";
import { Lead } from "../server/entities/Lead";
import { Interaction } from "../server/entities/Interaction";
import { Quote } from "../server/entities/Quote";
import { QuoteItem } from "../server/entities/QuoteItem";
import { Order } from "../server/entities/Order";
import { OrderItem } from "../server/entities/OrderItem";
import { ProductionTask } from "../server/entities/ProductionTask";
import { Invoice } from "../server/entities/Invoice";
import { Payment } from "../server/entities/Payment";
import { Expense } from "../server/entities/Expense";
import { Material } from "../server/entities/Material";
import { StockMovement } from "../server/entities/StockMovement";
import { Installation } from "../server/entities/Installation";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "../lib/constants";
import { quoteTotals, lineTotal, round2 } from "../lib/calc";

async function main() {
  const ds = await AppDataSource.initialize();

  // --- Rollar ---
  const roleRepo = ds.getRepository(Role);
  const roleByName: Record<string, Role> = {};
  for (const name of Object.keys(ROLE_PERMISSIONS)) {
    let role = await roleRepo.findOne({ where: { name } });
    if (!role) role = roleRepo.create({ name });
    role.label = ROLE_LABELS[name];
    role.permissions = ROLE_PERMISSIONS[name];
    roleByName[name] = await roleRepo.save(role);
  }
  console.log("✓ Rollar:", Object.keys(roleByName).join(", "));

  // --- Demo istifadəçilər (parol: demo1234) ---
  const userRepo = ds.getRepository(User);
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const demoUsers = [
    { name: "Admin İstifadəçi", email: "admin@admedia.az", role: "ADMIN" },
    { name: "Səbinə Satış", email: "sales@admedia.az", role: "SALES" },
    { name: "Rəşad İstehsalat", email: "production@admedia.az", role: "PRODUCTION" },
    { name: "Leyla Mühasib", email: "finance@admedia.az", role: "FINANCE" },
  ];
  for (const u of demoUsers) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) user = userRepo.create({ email: u.email });
    user.name = u.name;
    user.passwordHash = passwordHash;
    user.roleId = roleByName[u.role].id;
    user.isActive = true;
    await userRepo.save(user);
  }
  console.log(`✓ ${demoUsers.length} demo istifadəçi (parol: demo1234)`);
  const salesUser = await userRepo.findOne({ where: { email: "sales@admedia.az" } });

  // --- Xidmət kataloqu (real AZ xidmətlər) ---
  const catalogRepo = ds.getRepository(ServiceCatalog);
  if ((await catalogRepo.count()) === 0) {
    const services = [
      ["Qabarıq hərflər (işıqlı)", "OUTDOOR", "M2", 180, 35],
      ["İşıqlı qutu reklam (laytboks)", "OUTDOOR", "M2", 150, 35],
      ["Fasad işləri", "OUTDOOR", "M2", 120, 30],
      ["LED ekran modulu", "OUTDOOR", "PIECE", 220, 25],
      ["Bilbord konstruksiyası", "OUTDOOR", "PIECE", 3500, 20],
      ["Neon reklam", "OUTDOOR", "METER", 60, 35],
      ["Banner çapı", "PRINTING", "M2", 12, 40],
      ["Vinil çapı", "PRINTING", "M2", 15, 40],
      ["Setka (mesh) çapı", "PRINTING", "M2", 14, 40],
      ["Backlit çapı", "PRINTING", "M2", 22, 40],
      ["Avtobrendinq (tam)", "VEHICLE", "SERVICE", 450, 30],
      ["Sərgi stendi", "DISPLAY", "PIECE", 900, 30],
      ["Roll-up stend", "DISPLAY", "PIECE", 85, 45],
      ["Lazer / CNC kəsim", "CUTTING", "M2", 40, 35],
      ["3D dizayn", "DESIGN", "SERVICE", 150, 50],
      ["Montaj / quraşdırma", "INSTALLATION", "SERVICE", 200, 25],
    ] as const;
    for (const [name, category, unit, price, margin] of services) {
      await catalogRepo.save(
        catalogRepo.create({
          name,
          category,
          unit,
          defaultPrice: String(price),
          defaultMargin: String(margin),
          isActive: true,
        }),
      );
    }
    console.log(`✓ ${services.length} xidmət kataloqu`);
  }

  // --- Müştərilər ---
  const custRepo = ds.getRepository(Customer);
  const savedCustomers: Customer[] = [];
  if ((await custRepo.count()) === 0) {
    const names = [
      "Günəş Market MMC",
      "Bakı Tikinti ASC",
      "Xəzər Restoran",
      "Aygün Kosmetika",
      "Zəfər Avtomobil",
      "Nur Əczaçılıq",
      "Palma Mebel",
      "Kaspi Logistika",
      "Orxan Tekstil",
      "Səba Klinika",
      "Alov Benzin MMC",
      "Lider Sığorta",
      "Muğam Kafe",
      "Bahar Toy Sarayı",
      "Region Ticarət MMC",
    ];
    const districts = ["Nəsimi", "Yasamal", "Nizami", "Xətai", "Sabunçu", "Binəqədi"];
    for (let i = 0; i < names.length; i++) {
      const c = custRepo.create({
        name: names[i],
        type: i % 5 === 0 ? "INDIVIDUAL" : "COMPANY",
        taxId: `${1000000000 + i * 137}`.slice(0, 10),
        contactPerson: ["Elçin", "Aygün", "Rəşad", "Nigar", "Tural", "Günel"][i % 6] + " " + ["Məmmədov", "Əliyeva", "Hüseynov"][i % 3],
        phone: `+994 ${["50", "51", "55", "70", "77"][i % 5]} ${100 + i} ${10 + i} ${20 + i}`,
        email: `info@${["gunes", "baku", "xezer", "aygun", "zefer", "nur", "palma", "kaspi", "orxan", "seba", "alov", "lider", "mugam", "bahar", "region"][i]}.az`,
        address: `Bakı, ${districts[i % districts.length]} r., ${10 + i} saylı bina`,
        note: i % 4 === 0 ? "Daimi müştəri" : null,
      });
      savedCustomers.push(await custRepo.save(c));
    }
    console.log(`✓ ${names.length} müştəri`);
  }

  // --- Leadlər ---
  const leadRepo = ds.getRepository(Lead);
  if ((await leadRepo.count()) === 0) {
    const leads = [
      ["Yeni Ticarət Mərkəzi", "WEBSITE", "NEW"],
      ["Ay Ulduz Market", "CALL", "CONTACTED"],
      ["Premium Geyim Butik", "REFERRAL", "QUOTED"],
      ["Şəfa Diş Klinikası", "EXHIBITION", "CONTACTED"],
      ["Dadlı Şirniyyat", "CALL", "NEW"],
      ["Fit Zone İdman Klubu", "WEBSITE", "QUOTED"],
      ["Elit Mebel Salonu", "REFERRAL", "WON"],
      ["Sürət Kuryer", "OTHER", "LOST"],
    ] as const;
    for (let i = 0; i < leads.length; i++) {
      const [name, source, status] = leads[i];
      await leadRepo.save(
        leadRepo.create({
          name,
          source,
          status,
          phone: `+994 ${["50", "55", "70"][i % 3]} ${200 + i} ${30 + i} ${40 + i}`,
          email: null,
          note: null,
          assignedToId: salesUser?.id ?? null,
        }),
      );
    }
    console.log(`✓ ${leads.length} lead`);
  }

  // --- Əlaqələr (ilk müştərilər üçün) ---
  const interRepo = ds.getRepository(Interaction);
  if ((await interRepo.count()) === 0 && savedCustomers.length > 0) {
    const samples = [
      { type: "CALL", summary: "İlkin zəng, tələblər dəqiqləşdirildi. Təklif gözləyir." },
      { type: "MEETING", summary: "Ofisdə görüş, obyektin ölçüləri alındı." },
      { type: "EMAIL", summary: "Dizayn maketləri email ilə göndərildi." },
    ];
    let count = 0;
    for (let i = 0; i < Math.min(5, savedCustomers.length); i++) {
      for (let j = 0; j <= i % 3; j++) {
        const s = samples[j % samples.length];
        await interRepo.save(
          interRepo.create({
            customerId: savedCustomers[i].id,
            userId: salesUser?.id ?? null,
            type: s.type,
            summary: s.summary,
            nextActionAt: j === 0 ? new Date(Date.now() + 3 * 864e5) : null,
          }),
        );
        count++;
      }
    }
    console.log(`✓ ${count} əlaqə qeydi`);
  }

  // --- Təkliflər ---
  const quoteRepo = ds.getRepository(Quote);
  const itemRepo = ds.getRepository(QuoteItem);
  const custList = savedCustomers.length
    ? savedCustomers
    : await custRepo.find({ order: { id: "ASC" }, take: 10 });
  if ((await quoteRepo.count()) === 0 && custList.length >= 5) {
    const year = new Date().getFullYear();
    type L = { desc: string; unit: string; qty: number; mat: number; lab: number; tr: number; inst: number; margin: number };
    const defs: { custIdx: number; status: string; items: L[] }[] = [
      {
        custIdx: 0,
        status: "APPROVED",
        items: [
          { desc: "Qabarıq işıqlı hərflər — fasad", unit: "M2", qty: 6, mat: 1080, lab: 300, tr: 80, inst: 250, margin: 35 },
          { desc: "LED ekran modulu (P4)", unit: "PIECE", qty: 4, mat: 880, lab: 150, tr: 60, inst: 200, margin: 25 },
        ],
      },
      {
        custIdx: 1,
        status: "SENT",
        items: [
          { desc: "Bilbord konstruksiyası 3×6m", unit: "PIECE", qty: 1, mat: 3500, lab: 600, tr: 300, inst: 800, margin: 20 },
        ],
      },
      {
        custIdx: 2,
        status: "DRAFT",
        items: [
          { desc: "Baner çapı + montaj", unit: "M2", qty: 24, mat: 288, lab: 90, tr: 40, inst: 120, margin: 40 },
          { desc: "Roll-up stend", unit: "PIECE", qty: 3, mat: 255, lab: 30, tr: 20, inst: 0, margin: 45 },
        ],
      },
      {
        custIdx: 3,
        status: "APPROVED",
        items: [
          { desc: "Avtobrendinq (tam) — 2 avtomobil", unit: "SERVICE", qty: 2, mat: 900, lab: 400, tr: 0, inst: 200, margin: 30 },
        ],
      },
      {
        custIdx: 4,
        status: "REJECTED",
        items: [
          { desc: "Sərgi stendi (modul) 12 m²", unit: "M2", qty: 12, mat: 1200, lab: 500, tr: 150, inst: 400, margin: 30 },
        ],
      },
      {
        custIdx: 5,
        status: "SENT",
        items: [
          { desc: "İşıqlı qutu reklam (laytboks)", unit: "M2", qty: 8, mat: 1200, lab: 280, tr: 90, inst: 300, margin: 35 },
          { desc: "3D dizayn xidməti", unit: "SERVICE", qty: 1, mat: 0, lab: 300, tr: 0, inst: 0, margin: 50 },
        ],
      },
    ];
    let seq = 1;
    for (const d of defs) {
      if (d.custIdx >= custList.length) continue;
      const costs = d.items.map((i) => ({
        materialCost: i.mat,
        laborCost: i.lab,
        transportCost: i.tr,
        installCost: i.inst,
        marginPct: i.margin,
      }));
      const t = quoteTotals(costs, 18);
      const q = await quoteRepo.save(
        quoteRepo.create({
          number: `QUO-${year}-${String(seq).padStart(4, "0")}`,
          customerId: custList[d.custIdx].id,
          status: d.status,
          version: 1,
          validUntil: null,
          vatRate: "18",
          subtotal: String(t.subtotal),
          marginAmount: String(t.marginAmount),
          vatAmount: String(t.vatAmount),
          total: String(t.total),
          assignedToId: salesUser?.id ?? null,
          note: null,
        }),
      );
      for (const i of d.items) {
        const lt = lineTotal({
          materialCost: i.mat,
          laborCost: i.lab,
          transportCost: i.tr,
          installCost: i.inst,
          marginPct: i.margin,
        });
        await itemRepo.save(
          itemRepo.create({
            quoteId: q.id,
            serviceId: null,
            description: i.desc,
            qty: String(i.qty),
            unit: i.unit,
            materialCost: String(i.mat),
            laborCost: String(i.lab),
            transportCost: String(i.tr),
            installCost: String(i.inst),
            marginPct: String(i.margin),
            lineTotal: String(lt),
          }),
        );
      }
      seq++;
    }
    console.log(`✓ ${defs.length} təklif`);
  }

  // --- Sifarişlər (təsdiqlənmiş təkliflərdən) ---
  const orderRepo = ds.getRepository(Order);
  const orderItemRepo = ds.getRepository(OrderItem);
  if ((await orderRepo.count()) === 0) {
    const approved = await quoteRepo.find({
      where: { status: "APPROVED" },
      relations: { items: true },
      order: { id: "ASC" },
    });
    const year = new Date().getFullYear();
    const statuses = ["IN_PROGRESS", "DELIVERED"];
    let oseq = 1;
    for (let i = 0; i < approved.length; i++) {
      const q = approved[i];
      const deadline = new Date(Date.now() + (10 + i * 7) * 864e5)
        .toISOString()
        .slice(0, 10);
      const order = await orderRepo.save(
        orderRepo.create({
          number: `ORD-${year}-${String(oseq).padStart(4, "0")}`,
          quoteId: q.id,
          customerId: q.customerId,
          status: statuses[i % statuses.length],
          deadline,
          total: q.total,
          assignedToId: salesUser?.id ?? null,
        }),
      );
      for (const it of q.items ?? []) {
        await orderItemRepo.save(
          orderItemRepo.create({
            orderId: order.id,
            serviceId: it.serviceId,
            description: it.description,
            qty: it.qty,
            unit: it.unit,
            lineTotal: it.lineTotal,
          }),
        );
      }
      oseq++;
    }
    console.log(`✓ ${approved.length} sifariş`);
  }

  // --- İstehsalat tapşırıqları ---
  const prodTaskRepo = ds.getRepository(ProductionTask);
  if ((await prodTaskRepo.count()) === 0) {
    const prodUser = await userRepo.findOne({
      where: { email: "production@admedia.az" },
    });
    const ordersForTasks = await orderRepo.find({
      relations: { items: true },
      order: { id: "ASC" },
    });
    const machines = ["LASER", "ROLAND", "CNC", "MIMAKI", "MANUAL"];
    const stages = ["PENDING", "DESIGN", "PRODUCTION", "QC", "DONE"];
    let count = 0;
    let mi = 0;
    let si = 0;
    for (const o of ordersForTasks) {
      // Dizayn tapşırığı
      await prodTaskRepo.save(
        prodTaskRepo.create({
          orderId: o.id,
          orderItemId: null,
          title: "Dizayn maketinin hazırlanması",
          stage: "DESIGN",
          assigneeId: prodUser?.id ?? null,
          machine: null,
          deadline: o.deadline,
          position: 0,
          note: null,
        }),
      );
      count++;
      // Hər sətir üzrə istehsalat tapşırığı
      const items = o.items ?? [];
      for (let k = 0; k < items.length; k++) {
        await prodTaskRepo.save(
          prodTaskRepo.create({
            orderId: o.id,
            orderItemId: items[k].id,
            title: items[k].description.slice(0, 180),
            stage: stages[si % stages.length],
            assigneeId: prodUser?.id ?? null,
            machine: machines[mi % machines.length],
            deadline: o.deadline,
            position: k + 1,
            note: null,
          }),
        );
        count++;
        mi++;
        si++;
      }
    }
    console.log(`✓ ${count} istehsalat tapşırığı`);
  }

  // --- Maliyyə (faktura, ödəniş, xərc) ---
  const invRepo = ds.getRepository(Invoice);
  const payRepo = ds.getRepository(Payment);
  const expRepo = ds.getRepository(Expense);
  if ((await invRepo.count()) === 0) {
    const finUser = await userRepo.findOne({ where: { email: "finance@admedia.az" } });
    const ords = await orderRepo.find({ order: { id: "ASC" } });
    const year = new Date().getFullYear();
    let iseq = 1;
    for (let i = 0; i < ords.length; i++) {
      const o = ords[i];
      const total = Number(o.total);
      const vat = round2((total * 18) / 118);
      const amount = round2(total - vat);
      const issuedAt = new Date(Date.now() - (5 + i * 3) * 864e5).toISOString().slice(0, 10);
      const dueAt = new Date(Date.now() + (25 - i * 3) * 864e5).toISOString().slice(0, 10);
      const payFrac = i === 0 ? 0.5 : 1;
      const paidAmount = round2(total * payFrac);
      const status = paidAmount >= total ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";
      const inv = await invRepo.save(
        invRepo.create({
          number: `INV-${year}-${String(iseq).padStart(4, "0")}`,
          orderId: o.id,
          amount: String(amount),
          vatAmount: String(vat),
          total: String(total),
          status,
          issuedAt,
          dueAt,
        }),
      );
      if (paidAmount > 0) {
        await payRepo.save(
          payRepo.create({
            invoiceId: inv.id,
            amount: String(paidAmount),
            method: i === 0 ? "TRANSFER" : "CASH",
            paidAt: issuedAt,
            note: null,
          }),
        );
      }
      await expRepo.save(
        expRepo.create({
          orderId: o.id,
          category: "MATERIAL",
          amount: String(round2(total * 0.35)),
          description: "Material alışı",
          spentAt: issuedAt,
          createdById: finUser?.id ?? null,
        }),
      );
      await expRepo.save(
        expRepo.create({
          orderId: o.id,
          category: "LABOR",
          amount: String(round2(total * 0.15)),
          description: "İşçilik xərci",
          spentAt: issuedAt,
          createdById: finUser?.id ?? null,
        }),
      );
      iseq++;
    }
    await expRepo.save(
      expRepo.create({
        orderId: null,
        category: "RENT",
        amount: "1200.00",
        description: "Emalatxana icarəsi (aylıq)",
        spentAt: new Date().toISOString().slice(0, 10),
        createdById: finUser?.id ?? null,
      }),
    );
    console.log("✓ fakturalar, ödənişlər və xərclər");
  }

  // --- Anbar (materiallar + hərəkətlər) ---
  const matRepo = ds.getRepository(Material);
  const moveRepo = ds.getRepository(StockMovement);
  if ((await matRepo.count()) === 0) {
    const mats: [string, string, number, number, number][] = [
      ["Vinil (mat)", "M2", 120, 30, 8.5],
      ["Vinil (parlaq)", "M2", 15, 20, 9.0],
      ["Baner (440q)", "M2", 200, 50, 6.0],
      ["Setka (mesh)", "M2", 60, 40, 7.5],
      ["Akril 3mm", "M2", 25, 10, 45.0],
      ["Akril 5mm", "M2", 8, 12, 60.0],
      ["Foreks 5mm", "M2", 40, 15, 22.0],
      ["MDF 18mm", "PIECE", 30, 10, 35.0],
      ["LED lent (12V)", "METER", 500, 100, 3.2],
      ["Alüminium profil", "METER", 80, 50, 12.0],
      ["Laminat plyonka", "ROLL", 6, 8, 90.0],
    ];
    const byName: Record<string, Material> = {};
    for (const [name, unit, stock, min, cost] of mats) {
      byName[name] = await matRepo.save(
        matRepo.create({
          name,
          unit,
          stockQty: String(stock),
          minQty: String(min),
          avgCost: String(cost),
          isActive: true,
        }),
      );
    }
    console.log(`✓ ${mats.length} material`);

    const firstOrderId =
      (await orderRepo.find({ order: { id: "ASC" }, take: 1 }))[0]?.id ?? null;
    const moves: [string, string, number, string, number | null][] = [
      ["Vinil (mat)", "IN", 50, "Alış", null],
      ["Baner (440q)", "OUT", 24, "Sifarişə sərf", firstOrderId],
      ["LED lent (12V)", "IN", 200, "Alış", null],
      ["Akril 3mm", "OUT", 6, "Sifarişə sərf", firstOrderId],
      ["Foreks 5mm", "OUT", 8, "Kəsim", null],
    ];
    for (const [name, type, qty, reason, orderId] of moves) {
      const m = byName[name];
      if (!m) continue;
      await moveRepo.save(
        moveRepo.create({
          materialId: m.id,
          type,
          qty: String(qty),
          unitCost: type === "IN" ? m.avgCost : null,
          reason,
          orderId,
          createdById: salesUser?.id ?? null,
        }),
      );
    }
    console.log(`✓ ${moves.length} anbar hərəkəti`);
  }

  // --- Quraşdırma tapşırıqları ---
  const instRepo = ds.getRepository(Installation);
  if ((await instRepo.count()) === 0) {
    const ords = await orderRepo.find({ order: { id: "ASC" } });
    const statuses = ["PLANNED", "IN_PROGRESS"];
    const districts = ["Nəsimi", "Yasamal", "Nizami"];
    let c = 0;
    for (let i = 0; i < ords.length; i++) {
      const o = ords[i];
      const sched = new Date(Date.now() + (3 + i * 4) * 864e5);
      sched.setHours(10, 0, 0, 0);
      await instRepo.save(
        instRepo.create({
          orderId: o.id,
          type: "MOUNT",
          address: `Bakı, ${districts[i % districts.length]} r., obyekt ${10 + i}`,
          mapUrl: "https://maps.google.com",
          scheduledAt: sched,
          status: statuses[i % statuses.length],
          assigneeId: null,
          teamNote: "2 nəfərlik briqada, avtovışka lazımdır.",
        }),
      );
      c++;
    }
    console.log(`✓ ${c} quraşdırma tapşırığı`);
  }

  await ds.destroy();
  console.log("Seed tamamlandı.");
}

main().catch((err) => {
  console.error("Seed xətası:", err);
  process.exit(1);
});
