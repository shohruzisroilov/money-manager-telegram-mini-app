# 💰 Money Manager — Telegram Mini App

> Telegram ichida ishlaydigan shaxsiy moliya menejeri. Kirim-chiqimlarni kuzating, statistikani ko'ring.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## � Demo

> Telegramda sinab ko'rish: [@money_manager_uz_bot](https://t.me/money_manager_uz_bot)

---

## ✨ Imkoniyatlar

- 💰 Kirim va chiqimlarni qayd etish
- 🏷️ Kategoriyalar bo'yicha guruhlash (emoji ikonlar bilan)
- � Oylik statistika — bar chart va pie chart
- � Sana bo'yicha filtrlash
- 🔐 Telegram orqali avtomatik autentifikatsiya (har bir user o'z ma'lumotlariga ega)
- 📱 Telegram Mini App UI/UX — mobil uchun optimallashtirilgan
- 🌐 O'zbekcha interfeys

---

## 🛠 Texnologiyalar

| Qatlam | Texnologiyalar |
|--------|----------------|
| **Frontend** | React 18, TypeScript, Vite, Recharts, Lucide Icons |
| **Backend** | Node.js, TypeScript, Express.js |
| **Ma'lumotlar bazasi** | PostgreSQL |
| **Auth** | Telegram WebApp `initData` HMAC-SHA256 verification |
| **Deploy** | Hetzner VPS, Nginx, PM2, Let's Encrypt SSL |

---

## 🚀 O'rnatish va ishga tushirish

### Talablar

- Node.js 20+
- PostgreSQL 14+
- Telegram Bot token ([BotFather](https://t.me/BotFather) dan)

### 1. Reponi klonlash

```bash
git clone https://github.com/shohruzisroilov/money-manager-telegram-mini-app.git
cd money-manager-telegram-mini-app
```

### 2. PostgreSQL bazasini yaratish

```sql
CREATE DATABASE money_manager;
```

### 3. Backend sozlash

```bash
cd backend
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/money_manager
CLIENT_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

```bash
npm install
npm run dev
```

Server `http://localhost:3000` da ishga tushadi. Jadvallar avtomatik yaratiladi.

### 4. Frontend sozlash

```bash
cd frontend
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

Frontend `http://localhost:5173` da ochiladi.

> **Eslatma:** `npm run dev` da brauzerda ochilganda test user bilan ishlaydi. Real Telegram user uchun deploy qilish kerak.

---

## 🌐 Production ga deploy qilish (Hetzner VPS)

### Talablar
- Hetzner CX22 server (Ubuntu 24.04) — ~$4.99/oy
- [DuckDNS](https://www.duckdns.org) bepul subdomain (HTTPS uchun)

---

### 1. Server ga kirish

```bash
ssh root@YOUR_SERVER_IP
```

### 2. Tizimni yangilash va kerakli dasturlarni o'rnatish

```bash
apt update && apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PostgreSQL
apt install -y postgresql postgresql-contrib

# Nginx
apt install -y nginx

# PM2 (process manager)
npm install -g pm2

# Certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Git
apt install -y git
```

### 3. PostgreSQL sozlash

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE money_manager;
CREATE USER mmuser WITH PASSWORD 'kuchli_parol_yozing';
GRANT ALL PRIVILEGES ON DATABASE money_manager TO mmuser;
\q
```

### 4. DuckDNS subdomain olish

1. [duckdns.org](https://www.duckdns.org) ga kiring (GitHub/Google bilan)
2. Subdomain yarating: masalan `moneymanager` → `moneymanager.duckdns.org`
3. **current ip** ga serveringiz IP sini kiriting → **update ip**

### 5. Loyihani serverga yuklash

```bash
cd /var/www
git clone https://github.com/shohruzisroilov/money-manager-telegram-mini-app.git
cd money-manager-telegram-mini-app
```

### 6. Backend sozlash

```bash
cd backend
npm install
npm run build

# .env fayl yaratish
cp .env.example .env
nano .env
```

`.env` faylini to'ldiring:

```env
PORT=3000
DATABASE_URL=postgresql://mmuser:kuchli_parol_yozing@localhost:5432/money_manager
CLIENT_URL=https://moneymanager.duckdns.org
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=production
```

### 7. Frontend build

```bash
cd ../frontend
npm install

# .env fayl
echo "VITE_API_URL=https://moneymanager.duckdns.org/api" > .env.local
# Lekin biz Nginx orqali /api proxy qilamiz, shuning uchun:
echo "VITE_API_URL=" > .env.local

npm run build
```

> **Eslatma:** Nginx backend `/api` ni proxy qiladi, frontend va backend bir domenda ishlaydi.

### 8. PM2 bilan backendni ishga tushirish

```bash
cd /var/www/money-manager-telegram-mini-app/backend
pm2 start dist/index.js --name money-manager-api
pm2 save
pm2 startup
```

### 9. Nginx sozlash

```bash
nano /etc/nginx/sites-available/money-manager
```

Quyidagi konfigni kiriting:

```nginx
server {
    listen 80;
    server_name moneymanager.duckdns.org;

    # Frontend (static files)
    location / {
        root /var/www/money-manager-telegram-mini-app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/money-manager /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 10. SSL sertifikat (HTTPS)

```bash
certbot --nginx -d moneymanager.duckdns.org
```

Savollarga javob bering (email, agree) — SSL avtomatik o'rnatiladi.

### 11. Telegram Bot sozlash

[@BotFather](https://t.me/BotFather) da:

```
/setmenubutton
→ Botingizni tanlang
→ URL: https://moneymanager.duckdns.org
→ Tugma nomi: 💰 Money Manager
```

### 12. Tekshirish

```bash
# Backend ishlayaptimi?
pm2 status

# Nginx ishlayaptimi?
systemctl status nginx

# Loglar
pm2 logs money-manager-api
```

Brauzerda `https://moneymanager.duckdns.org` ni oching ✅

---

### Yangilanishlarni deploy qilish

```bash
cd /var/www/money-manager-telegram-mini-app
git pull

# Backend
cd backend && npm run build
pm2 restart money-manager-api

# Frontend
cd ../frontend && npm run build
```

---

## 📡 API

### Auth
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| `POST` | `/api/auth/telegram` | Telegram initData orqali kirish |

### Kategoriyalar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| `GET` | `/api/categories?user_id=` | Barcha kategoriyalar |
| `POST` | `/api/categories` | Yangi kategoriya |
| `DELETE` | `/api/categories/:id` | O'chirish |

### Tranzaksiyalar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| `GET` | `/api/transactions?user_id=` | Tranzaksiyalar ro'yxati |
| `GET` | `/api/transactions/stats?user_id=&year=&month=` | Oylik statistika |
| `POST` | `/api/transactions` | Yangi tranzaksiya |
| `DELETE` | `/api/transactions/:id` | O'chirish |

---

## 📁 Loyiha tuzilmasi

```
money-manager-telegram-mini-app/
├── backend/
│   ├── routes/
│   │   ├── auth.ts          # Telegram auth
│   │   ├── transactions.ts  # Tranzaksiyalar CRUD
│   │   ├── categories.ts    # Kategoriyalar CRUD
│   │   ├── accounts.ts      # Hisoblar CRUD
│   │   └── users.ts         # Foydalanuvchilar
│   ├── db.ts                # PostgreSQL ulanish
│   ├── migrations.ts        # DB jadvallar
│   ├── telegram.ts          # initData verification
│   └── index.ts             # Express server
└── frontend/
    └── src/
        ├── components/
        │   ├── AddTransactionModal.tsx
        │   ├── AuthGate.tsx
        │   ├── BottomNav.tsx
        │   └── Toast.tsx
        ├── context/
        │   └── AppContext.tsx
        ├── pages/
        │   ├── Home.tsx
        │   ├── Transactions.tsx
        │   ├── Stats.tsx
        │   └── Settings.tsx
        └── utils/
            └── format.ts
```

---

## 🤝 Hissa qo'shish (Contributing)

Pull request lar xush kelibsiz!

1. Fork qiling
2. Branch yarating: `git checkout -b feature/yangi-imkoniyat`
3. O'zgarishlarni commit qiling: `git commit -m 'feat: yangi imkoniyat qo'shildi'`
4. Push qiling: `git push origin feature/yangi-imkoniyat`
5. Pull Request oching

---

## 📄 Litsenziya

Bu loyiha [MIT](./LICENSE) litsenziyasi ostida tarqatiladi.

---

## 👤 Muallif

**Shohruz** — [@Shohruz_Isroilov](https://t.me/Shohruz_Isroilov)
