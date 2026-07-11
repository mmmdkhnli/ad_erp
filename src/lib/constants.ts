/** Cədvəllərdə səhifə ölçüsü (server-tərəf pagination). */
export const PAGE_SIZE = 10;

/** Rol → Azərbaycan etiketi. */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Rəhbər",
  SALES: "Satış meneceri",
  PRODUCTION: "İstehsalat rəhbəri",
  FINANCE: "Mühasib",
  DESIGNER: "Dizayner",
  INSTALLER: "Quraşdırıcı",
  WAREHOUSE: "Anbardar",
};

/** Rol → icazə açarları (RBAC). Bax docs/05-architecture.md. */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"],
  SALES: ["dashboard:read", "crm:*", "quotes:*", "orders:read"],
  PRODUCTION: [
    "dashboard:read",
    "orders:read",
    "orders:write",
    "production:*",
    "inventory:read",
    "installations:*",
  ],
  FINANCE: ["dashboard:read", "orders:read", "finance:*", "reports:read"],
  DESIGNER: ["dashboard:read", "production:read", "production:write"],
  INSTALLER: ["dashboard:read", "installations:read", "installations:write"],
  WAREHOUSE: ["dashboard:read", "inventory:*"],
};

/** Status rəng tonları (docs/06-design-system.md). */
export type Tone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent2";

/** Lead statusu → etiket + ton. */
export const LEAD_STATUS: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: "Yeni", tone: "neutral" },
  CONTACTED: { label: "Əlaqə saxlanılıb", tone: "info" },
  QUOTED: { label: "Təklif verilib", tone: "warning" },
  WON: { label: "Uğurlu", tone: "success" },
  LOST: { label: "İtirilmiş", tone: "danger" },
};

export const LEAD_SOURCE: Record<string, string> = {
  REFERRAL: "Tövsiyə",
  WEBSITE: "Sayt",
  CALL: "Zəng",
  EXHIBITION: "Sərgi",
  OTHER: "Digər",
};

export const CUSTOMER_TYPE: Record<string, string> = {
  INDIVIDUAL: "Fiziki şəxs",
  COMPANY: "Hüquqi şəxs",
};

export const INTERACTION_TYPE: Record<string, string> = {
  CALL: "Zəng",
  MEETING: "Görüş",
  EMAIL: "Email",
};

/** Təklif statusu → etiket + ton. */
export const QUOTE_STATUS: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Qaralama", tone: "neutral" },
  SENT: { label: "Göndərilib", tone: "info" },
  APPROVED: { label: "Təsdiqlənib", tone: "success" },
  REJECTED: { label: "Rədd edilib", tone: "danger" },
  EXPIRED: { label: "Vaxtı keçib", tone: "warning" },
};

/** Quraşdırma tipi. */
export const INSTALLATION_TYPE: Record<string, string> = {
  MOUNT: "Montaj",
  DISMOUNT: "Demontaj",
  SERVICE: "Servis",
};

/** Quraşdırma statusu → etiket + ton. */
export const INSTALLATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  PLANNED: { label: "Planlanıb", tone: "neutral" },
  EN_ROUTE: { label: "Yolda", tone: "info" },
  IN_PROGRESS: { label: "İcrada", tone: "brand" },
  DONE: { label: "Tamamlanıb", tone: "success" },
};

/** Anbar hərəkəti → etiket + ton. */
export const STOCK_MOVEMENT_TYPE: Record<string, { label: string; tone: Tone }> = {
  IN: { label: "Mədaxil", tone: "success" },
  OUT: { label: "Məxaric", tone: "warning" },
  ADJUST: { label: "Düzəliş", tone: "info" },
};

/** İstehsalat mərhələsi → etiket + ton (Kanban sütunları). */
export const PRODUCTION_STAGE: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Gözləyir", tone: "neutral" },
  DESIGN: { label: "Dizayn", tone: "info" },
  PRODUCTION: { label: "İstehsalat", tone: "brand" },
  QC: { label: "Yoxlama", tone: "warning" },
  DONE: { label: "Hazır", tone: "success" },
};

export const PRODUCTION_STAGE_ORDER = ["PENDING", "DESIGN", "PRODUCTION", "QC", "DONE"];

/** İstehsalat avadanlığı. */
export const MACHINE_LABEL: Record<string, string> = {
  ROLAND: "Roland",
  MIMAKI: "Mimaki",
  CNC: "CNC",
  LASER: "Lazer",
  MANUAL: "Əl işi",
};

/** Sifariş statusu → etiket + ton. */
export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  NEW: { label: "Yeni", tone: "neutral" },
  IN_PROGRESS: { label: "İcrada", tone: "brand" },
  INSTALLING: { label: "Quraşdırmada", tone: "accent2" },
  DELIVERED: { label: "Təhvil verilib", tone: "success" },
  CLOSED: { label: "Bağlanıb", tone: "neutral" },
  CANCELLED: { label: "Ləğv edilib", tone: "danger" },
};

/** Faktura statusu → etiket + ton. */
export const INVOICE_STATUS: Record<string, { label: string; tone: Tone }> = {
  UNPAID: { label: "Ödənilməyib", tone: "danger" },
  PARTIAL: { label: "Qismən ödənilib", tone: "warning" },
  PAID: { label: "Ödənilib", tone: "success" },
};

export const PAYMENT_METHOD: Record<string, string> = {
  CASH: "Nağd",
  TRANSFER: "Köçürmə",
};

export const EXPENSE_CATEGORY: Record<string, string> = {
  MATERIAL: "Material",
  LABOR: "İşçilik",
  TRANSPORT: "Daşınma",
  RENT: "İcarə",
  OTHER: "Digər",
};

/** Xidmət kataloqu kateqoriyası → etiket. */
export const SERVICE_CATEGORY: Record<string, string> = {
  OUTDOOR: "Çöl reklam",
  PRINTING: "Çap",
  VEHICLE: "Avtobrendinq",
  DISPLAY: "Stend / mebel",
  POS: "POS material",
  CUTTING: "Kəsim",
  DESIGN: "Dizayn",
  INSTALLATION: "Quraşdırma",
};

/** Ölçü vahidi → qısa etiket. */
export const UNIT_LABEL: Record<string, string> = {
  M2: "m²",
  METER: "metr",
  PIECE: "ədəd",
  KG: "kq",
  SERVICE: "xidmət",
  ROLL: "rulon",
};

/** Sidebar naviqasiyası. icon = lucide-react ad. perm = tələb olunan icazə. */
export type NavItem = { href: string; label: string; icon: string; perm: string };

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", perm: "dashboard:read" },
  { href: "/crm", label: "CRM", icon: "Users", perm: "crm:read" },
  { href: "/quotes", label: "Təkliflər", icon: "FileText", perm: "quotes:read" },
  { href: "/orders", label: "Sifarişlər", icon: "Package", perm: "orders:read" },
  { href: "/production", label: "İstehsalat", icon: "Factory", perm: "production:read" },
  { href: "/installations", label: "Quraşdırma", icon: "Truck", perm: "installations:read" },
  { href: "/inventory", label: "Anbar", icon: "Boxes", perm: "inventory:read" },
  { href: "/finance", label: "Maliyyə", icon: "Wallet", perm: "finance:read" },
  { href: "/reports", label: "Hesabatlar", icon: "ChartColumn", perm: "reports:read" },
  { href: "/settings", label: "Parametrlər", icon: "Settings", perm: "settings:read" },
  { href: "/info", label: "Bələdçi", icon: "BookOpen", perm: "dashboard:read" },
];
