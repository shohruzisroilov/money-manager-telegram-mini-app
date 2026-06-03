# 💰 Money Manager — Telegram Mini App

> Telegram ichida ishlaydigan shaxsiy moliya menejeri. Kirim-chiqimlarni kuzating, statistikani ko'ring.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

---

## � Demo

> Telegramda sinab ko'rish: [@YourBotUsername](https://t.me/YourBotUsername)

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
| **Deploy** | Vercel (frontend), Railway (backend + DB) |

---

## 🚀 O'rnatish va ishga tushirish

### Talablar

- Node.js 20+
- PostgreSQL 14+
- Telegram Bot token ([BotFather](https://t.me/BotFather) dan)

### 1. Reponi klonlash

```bash
git clone https://github.com/YOUR_USERNAME/money-manager-telegram-mini-app.git
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

## 🌐 Production ga deploy qilish

### Backend — Railway

1. [railway.app](https://railway.app) → GitHub bilan kirish
2. **New Project** → **Deploy from GitHub repo**
3. **Root Directory** → `backend`
4. **Add Service** → **PostgreSQL** (Railway `DATABASE_URL` ni o'zi ulaydi)
5. **Variables** qo'shing:

```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
CLIENT_URL=https://your-app.vercel.app
PORT=3000
```

### Frontend — Vercel

1. [vercel.com](https://vercel.com) → GitHub bilan kirish
2. **New Project** → reponi tanlang
3. **Root Directory** → `frontend`
4. **Environment Variables**:

```env
VITE_API_URL=https://your-backend.railway.app
```

### Telegram Bot sozlash

[@BotFather](https://t.me/BotFather) da:

```
/newapp  yoki  /setmenubutton
URL: https://your-app.vercel.app
Tugma nomi: 💰 Money Manager
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

**Shohruz** — [@YourTelegram](https://t.me/YourTelegram)
