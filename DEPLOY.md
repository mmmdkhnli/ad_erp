# Deploy bələdçisi — AdErp

Bu sənəd: (1) GitHub repo yaratmaq və push, (2) VPS-də köhnə app-ı təmiz silib, köhnə MySQL bazasını saxlayaraq yeni baza əlavə edib, bu app-ı yerləşdirmək.

> Prinsip: **köhnə verilənlər bazasına toxunma**, yalnız yeni baza əlavə et; köhnə app-ı sil.

---

## 1. GitHub repo yaratmaq və kod göndərmək

Lokal repo hazırdır (`git init` + ilkin commit edilib, branch: `main`).

**a) GitHub-da boş repo yarat** (README-siz, .gitignore-suz — bizdə var):
- github.com → New repository → ad: `aderp` → **Private** (tövsiyə) → Create.

**b) Remote əlavə et və push et** (lokal terminaldan, layihə qovluğunda):
```bash
git remote add origin https://github.com/mmmdkhnli/aderp.git
git push -u origin main
```
> `gh` CLI quraşdırılıbsa daha qısa: `gh repo create aderp --private --source=. --push`.

**c) Sonrakı dəyişikliklər:**
```bash
git add -A && git commit -m "dəyişiklik təsviri" && git push
```

---

## 2. VPS hazırlığı

SSH ilə qoşul. Tələb olunanlar (yoxla / quraşdır):
- **Node.js 20+** (bu app Node 20+ tələb edir; `node -v`). Yoxdursa nvm ilə: `nvm install 20`.
- **MySQL / MariaDB** — artıq var.
- **nginx**, **git**, **pm2** (`npm i -g pm2`).

---

## 3. MySQL — köhnə bazanı SAXLA, yeni baza əlavə et

**a) Əvvəlcə köhnə bazanın ehtiyat nüsxəsi** (təhlükəsizlik üçün):
```bash
mysqldump -u root -p KOHNE_BAZA_ADI > ~/kohne_baza_backup_$(date +%F).sql
```

**b) Yeni baza + ayrıca istifadəçi yarat** (root yox, təhlükəsizlik üçün):
```bash
mysql -u root -p
```
```sql
CREATE DATABASE admedia_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'aderp'@'localhost' IDENTIFIED BY 'GÜCLÜ_PAROL_BURA';
GRANT ALL PRIVILEGES ON admedia_erp.* TO 'aderp'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
> Köhnə baza toxunulmur — yalnız `admedia_erp` əlavə olunur.

---

## 4. Köhnə server app-ını TƏMİZ sil (ehtiyatla)

**a) Nə işləyir — müəyyən et:**
```bash
pm2 list                      # pm2 ilə işləyirsə
systemctl list-units | grep -i node   # systemd servisidirsə
ls /etc/nginx/sites-enabled/  # nginx saytları
```

**b) Köhnə app fayllarının ehtiyat nüsxəsi:**
```bash
tar czf ~/kohne_app_backup_$(date +%F).tar.gz /var/www/KOHNE_APP
```

**c) Prosesi dayandır və sil:**
```bash
pm2 delete KOHNE_APP && pm2 save        # pm2-dirsə
# və ya: systemctl stop KOHNE && systemctl disable KOHNE
```

**d) nginx saytını sil:**
```bash
sudo rm /etc/nginx/sites-enabled/KOHNE_APP
sudo nginx -t && sudo systemctl reload nginx
```

**e) Faylları sil** (backup-dan sonra):
```bash
sudo rm -rf /var/www/KOHNE_APP
```
> ⚠️ MySQL-i və ya saxlamaq istədiyin bazanı SİLMƏ. Yalnız app fayllarını və köhnə app-ın nginx/prosesini sil.

---

## 5. Yeni app-ı yerləşdir

```bash
cd /var/www
git clone https://github.com/mmmdkhnli/aderp.git
cd aderp

# .env yarat
cp .env.example .env
nano .env
```
`.env` içində:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=aderp
DB_PASSWORD=GÜCLÜ_PAROL_BURA
DB_NAME=admedia_erp
AUTH_SECRET=<openssl rand -hex 32 nəticəsi>
```
Güclü secret yarat: `openssl rand -hex 32`.

**Quraşdır, migrasiya, build:**
```bash
npm ci --include=dev      # ⚠️ devDeps lazımdır (build üçün TS/Tailwind, migrasiya üçün tsx)
npm run migration:run     # sxemi admedia_erp-ə tətbiq edir (.env-dən oxuyur)
npm run seed              # OPSİONAL — demo/preview datası (real istifadədə buraxıla bilər)
npm run build             # next build (Linux-da Turbopack problemi yoxdur)
```
> ⚠️ `NODE_ENV=production` qlobal təyin olunubsa, `npm ci` devDeps-i buraxa bilər → `--include=dev` mütləq. Build və migrasiya devDeps tələb edir.

**pm2 ilə işə sal:**
```bash
pm2 start npm --name aderp -- start   # "npm start" = next start (port 3000)
pm2 save
pm2 startup                            # reboot-da avtomatik başlaması üçün (göstərilən əmri işlət)
```

---

## 6. nginx reverse proxy + HTTPS

`/etc/nginx/sites-available/aderp`:
```nginx
server {
    listen 80;
    server_name aderp.example.com;   # öz domenini/subdomenini yaz

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/aderp /etc/nginx/sites-enabled/aderp
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d aderp.example.com   # HTTPS (Let's Encrypt)
```

Preview link: `https://aderp.example.com` → müştəriyə göndər.
Demo giriş: `admin@admedia.az` / `demo1234`.

---

## 7. Sonrakı yeniləmələr (kod dəyişəndə)

```bash
cd /var/www/aderp
git pull
npm ci --include=dev
npm run migration:run     # yeni migrasiya varsa
npm run build
pm2 restart aderp
```

---

## Qeydlər
- **Development vs production:** lokalda `npm run dev` (webpack — Windows antivirus səbəbi). VPS-də (Linux) `npm run build` + `npm start` (`next start`) — Turbopack problemi yoxdur.
- **Migrasiya/seed `.env`-dən oxuyur** (`--env-file=.env` skriptlərə əlavə edilib).
- **Təhlükəsizlik:** `.env` heç vaxt commit olunmur (`.gitignore`-da). Production-da güclü `AUTH_SECRET` və ayrıca DB istifadəçisi işlət.
- **Backup:** deploy-dan əvvəl həm köhnə bazanı, həm köhnə app-ı arxivlə.
