# 04 — Verilənlər Bazası Modeli (Data Model)

> MySQL 8 + **TypeORM** (entity-əsaslı). Bütün entity-lərdə `id` (autoincrement `bigint` və ya `uuid`), `createdAt`, `updatedAt` (TypeORM `@CreateDateColumn` / `@UpdateDateColumn`). Silinmə əsasən `soft delete` (`@DeleteDateColumn deletedAt`) — sifariş/təklif/müştəri üçün.

---

## ER diaqramı (yüksək səviyyə)

```
User ──┐
       ├─< AuditLog
Role ──┘

Customer ──< Lead
Customer ──< Interaction
Customer ──< Quote ──< QuoteItem >── ServiceCatalog
                │
                ▼ (təsdiq)
             Order ──< OrderItem
              │  ├──< ProductionTask ──< MaterialUsage >── Material
              │  ├──< Installation
              │  ├──< Invoice ──< Payment
              │  ├──< Expense
              │  └──< Attachment
Material ──< StockMovement
Employee ──< ProductionTask (assignee)
Employee ──< Installation (team)
```

---

## Cədvəllər

### Auth & RBAC

**User**
| sahə | tip | qeyd |
|------|-----|------|
| id | PK | |
| name | string | |
| email | string, unique | login |
| passwordHash | string | bcrypt |
| roleId | FK → Role | |
| isActive | bool | default true |

**Role**
| id | PK |
| name | enum-string | ADMIN, SALES, PRODUCTION, FINANCE, DESIGNER, INSTALLER, WAREHOUSE |
| permissions | JSON | icazə açarları massivi (bax RBAC) |

**AuditLog**
| id, userId (FK), entityType, entityId, action, changes (JSON), createdAt |

---

### CRM

**Customer**
| id | PK |
| name | string |
| type | enum | INDIVIDUAL, COMPANY |
| taxId | string? | VÖEN |
| contactPerson | string? |
| phone, email, address | string? |
| note | text? |
| createdById | FK → User |
| deletedAt | datetime? |

**Lead**
| id | PK |
| customerId | FK? → Customer | (çevriləndə bağlanır) |
| name, phone, email | string |
| source | enum | REFERRAL, WEBSITE, CALL, EXHIBITION, OTHER |
| status | enum | NEW, CONTACTED, QUOTED, WON, LOST |
| assignedToId | FK → User |
| note | text? |

**Interaction**
| id, customerId (FK), userId (FK), type (CALL/MEETING/EMAIL), summary, nextActionAt, createdAt |

---

### Kataloq

**ServiceCatalog** (xidmət/məhsul növləri — [01-market-research.md] əsasında seed)
| id | PK |
| name | string | "Qabarıq hərflər", "Baner çapı"... |
| category | enum | OUTDOOR, PRINTING, VEHICLE, DISPLAY, POS, CUTTING, DESIGN, INSTALLATION |
| unit | enum | M2, METER, PIECE, KG, SERVICE |
| defaultPrice | decimal? | təxmini vahid qiymət |
| defaultMargin | decimal | % (default 30) |
| isActive | bool |

**Material**
| id | PK |
| name | string | "Vinil (mat)", "Akril 3mm"... |
| unit | enum | M2, METER, PIECE, KG, ROLL |
| stockQty | decimal | cari qalıq |
| minQty | decimal | minimum həd |
| avgCost | decimal | orta maya (₼) |
| isActive | bool |

---

### Təkliflər

**Quote**
| id | PK |
| number | string, unique | `QUO-2026-0001` |
| customerId | FK → Customer |
| version | int | default 1 |
| status | enum | DRAFT, SENT, APPROVED, REJECTED, EXPIRED |
| validUntil | date? |
| subtotal, marginAmount, vatAmount, total | decimal | hesablanmış |
| vatRate | decimal | default 18 |
| assignedToId | FK → User |
| note | text? |
| deletedAt | datetime? |

**QuoteItem**
| id | PK |
| quoteId | FK → Quote (cascade) |
| serviceId | FK? → ServiceCatalog |
| description | string |
| qty | decimal |
| unit | enum |
| materialCost | decimal |
| laborCost | decimal |
| transportCost | decimal |
| installCost | decimal |
| marginPct | decimal |
| lineTotal | decimal | hesablanmış (xərclər + marja) |

> **Hesablama qaydası:** `lineCost = material+labor+transport+install`; `lineTotal = lineCost × (1 + marginPct/100)`; `subtotal = Σ lineTotal`; `vatAmount = subtotal × vatRate/100`; `total = subtotal + vatAmount`.

---

### Sifarişlər

**Order**
| id | PK |
| number | string, unique | `ORD-2026-0001` |
| quoteId | FK? → Quote |
| customerId | FK → Customer |
| status | enum | NEW, IN_PROGRESS, INSTALLING, DELIVERED, CLOSED, CANCELLED |
| startDate, deadline | date? |
| total | decimal |
| assignedToId | FK → User |
| deletedAt | datetime? |

**OrderItem** (təklifdən kopyalanır)
| id, orderId (FK), serviceId (FK?), description, qty, unit, lineTotal |

---

### İstehsalat

**ProductionTask**
| id | PK |
| orderId | FK → Order |
| orderItemId | FK? → OrderItem |
| title | string |
| stage | enum | PENDING, DESIGN, PRODUCTION, QC, DONE |
| assigneeId | FK? → Employee |
| machine | enum? | ROLAND, MIMAKI, CNC, LASER, MANUAL |
| deadline | date? |
| note | text? |
| position | int | Kanban sıralaması |

**MaterialUsage**
| id, productionTaskId (FK), materialId (FK), qty (decimal), createdAt |
> Yaradılanda əlaqəli `StockMovement (OUT)` yaradır və `Material.stockQty` azalır.

**StockMovement**
| id, materialId (FK), type (IN/OUT/ADJUST), qty, unitCost?, reason, orderId?, createdById, createdAt |

---

### Quraşdırma

**Installation**
| id | PK |
| orderId | FK → Order |
| type | enum | MOUNT, DISMOUNT, SERVICE |
| address | string |
| mapUrl | string? |
| scheduledAt | datetime? |
| status | enum | PLANNED, EN_ROUTE, IN_PROGRESS, DONE |
| teamNote | string? |

**InstallationPhoto**
| id, installationId (FK), url, kind (BEFORE/AFTER), createdAt |

---

### Maliyyə

**Invoice**
| id | PK |
| number | string, unique | `INV-2026-0001` |
| orderId | FK → Order |
| amount, vatAmount, total | decimal |
| status | enum | UNPAID, PARTIAL, PAID |
| issuedAt, dueAt | date |

**Payment**
| id, invoiceId (FK), amount, method (CASH/TRANSFER), paidAt, note |

**Expense**
| id, orderId (FK?), category (MATERIAL/LABOR/TRANSPORT/RENT/OTHER), amount, description, spentAt, createdById |

> **Rentabellik (hesablanır, saxlanmır):** `revenue = Σ Invoice.total`; `cost = Σ Expense.amount + Σ MaterialUsage×avgCost`; `profit = revenue − cost`.

---

### İşçilər & ümumi

**Employee**
| id | PK |
| userId | FK? → User | (əgər sistemə girişi varsa) |
| name | string |
| role | enum | DESIGNER, OPERATOR, INSTALLER, MANAGER |
| phone | string? |
| isActive | bool |

**Attachment**
| id, entityType, entityId, url, filename, uploadedById, createdAt |

**CompanySettings** (tək sətir)
| id, name, taxId, logoUrl, invoiceInfo, vatRate (default 18), currency (default AZN) |

---

## İndekslər və qeydlər
- `Quote.number`, `Order.number`, `Invoice.number` — unique + generator (`PREFIX-YYYY-NNNN`).
- Filtr sahələri indekslənir: `status`, `customerId`, `assignedToId`, `deadline`, `createdAt`.
- `decimal(12,2)` pul üçün, `decimal(12,3)` miqdar üçün.
- Bütün mutasiyalar `AuditLog`-a yazılır (server action daxilində).
