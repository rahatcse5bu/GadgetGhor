# 🛒 GadgetGhor

A complete e-commerce platform for importing electronics from China and selling across Bangladesh — built for **mobile, laptop & electronics accessories**.

Full storefront + REST API + admin panel with **order tracking**, **product bundling**, **Cloudinary image upload** and **SMTP email delivery**.

| Layer | Tech |
|-------|------|
| Frontend (storefront + admin) | **Next.js 14** (App Router), **TailwindCSS**, Zustand, lucide-react |
| Backend (API) | **NestJS 10**, Mongoose, Passport-JWT, class-validator |
| Database | **MongoDB** (remote Atlas) |
| Images | **Cloudinary** |
| Email | **SMTP** via Nodemailer |

Brand color: **Teal `#2C8198`** (full `brand.50–950` palette in `tailwind.config.ts`).

---

## 📁 Project structure

```
GadgetGhor/
├── backend/        NestJS API  (port 4000)
│   └── src/
│       ├── auth/         JWT login/register + admin role guard
│       ├── users/        User schema & service
│       ├── products/     Product CRUD, search, filters, stock
│       ├── categories/   Category CRUD
│       ├── bundles/      Bundle builder (products → discounted kit)
│       ├── orders/       Checkout, tracking, status history, admin stats
│       ├── upload/       Cloudinary image upload
│       ├── mail/         Transactional emails (order/status/contact)
│       ├── contact/      Contact form → email
│       └── seed/         Sample data + admin seeder
└── frontend/       Next.js  (port 3000)
    └── src/
        ├── app/(store)/  Storefront: home, shop, product, bundles,
        │                 cart, checkout, thank-you, track, contact, policies
        ├── app/admin/    Admin: login, dashboard, products, bundles, orders
        ├── components/   Navbar, Footer, ProductCard, BundleCard, admin forms
        ├── store/        Cart & auth (Zustand)
        └── lib/          API client, types, formatting
```

---

## 🚀 Quick start

### Prerequisites
- Node.js 18+ (tested on Node 22)
- A MongoDB connection string (already configured for this project)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # already filled with the project's MongoDB URI
npm run seed                # creates admin + sample products/categories/bundle
npm run start:dev           # → http://localhost:4000/api
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env.local  # points to http://localhost:4000/api
npm run dev                 # → http://localhost:3000
```

Open **http://localhost:3000** for the store and **http://localhost:3000/admin** for the admin panel.

---

## 🔑 Default admin login

| | |
|--|--|
| **URL** | http://localhost:3000/admin |
| **Email** | `admin@gadgetghor.com` |
| **Password** | `Admin@12345` |

(Change these in `backend/.env` before running `npm run seed`.)

---

## ⚙️ Environment variables (`backend/.env`)

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...           # pre-configured
JWT_SECRET=change_me_in_production
ADMIN_EMAIL=admin@gadgetghor.com
ADMIN_PASSWORD=Admin@12345

# Cloudinary — required for image upload in admin
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# SMTP — required for real email delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="GadgetGhor <no-reply@gadgetghor.com>"
CONTACT_INBOX=support@gadgetghor.com
```

> **Note:** The app runs fine without Cloudinary/SMTP configured — image upload falls back to pasting URLs, and emails are logged to the console instead of sent. Add real credentials to enable both.

**Gmail tip:** use an [App Password](https://myaccount.google.com/apppasswords) (not your normal password) with 2FA enabled.

---

## ✨ Features

### Storefront (conversion-focused)
- **Home** — hero, trust badges, categories, featured products, bundle deals, new arrivals
- **Shop** — category sidebar, sort, search, pagination
- **Product page** — image gallery, specs, stock urgency ("Only 3 left!"), quantity, *Buy now*
- **Bundles** — combo kits showing savings vs. buying separately
- **Cart** — persistent (localStorage), free-shipping progress bar
- **Checkout** — single-page, COD/bKash/Nagad, live shipping calc, guest checkout
- **Thank-you** — order confirmation + next-steps timeline + track link
- **Order tracking** — public, by order number (+ optional email/phone for privacy)
- **Contact us**, **Return policy**, **Privacy policy** pages

### Admin panel
- **Dashboard** — revenue, order counts by status, recent orders
- **Products** — full CRUD, multi-image upload (Cloudinary), specs, pricing (with private import cost), stock, featured/active toggles
- **Bundles** — visual bundle builder: search & add products, set quantities, live savings preview
- **Orders** — filter by status, search, full detail view, **update status + tracking carrier/code → auto-emails the customer**

### Backend
- JWT auth with `admin` / `customer` roles
- Server-side price resolution (never trusts client cart prices)
- Automatic stock decrement on order, status-history audit trail
- Free shipping over ৳5,000; ৳60 inside Dhaka / ৳120 outside
- Transactional emails: order confirmation, status updates, contact form

---

## 🔌 Key API endpoints

```
POST   /api/auth/login                 Admin/customer login
GET    /api/products                   List (search, category, sort, page)
GET    /api/products/slug/:slug        Single product
POST   /api/products                   Create (admin)
GET    /api/bundles                    List bundles (with savings)
POST   /api/bundles                    Create bundle (admin)
POST   /api/orders                     Place order (guest or user)
GET    /api/orders/track/:orderNumber  Public tracking
GET    /api/orders/admin/all           List orders (admin)
PATCH  /api/orders/admin/:id/status    Update status + notify (admin)
GET    /api/orders/admin/stats         Dashboard stats (admin)
POST   /api/upload/images              Cloudinary upload (admin)
POST   /api/contact                    Contact form → email
```

---

## 🏗️ Production build

```bash
# Backend
cd backend && npm run build && npm run start:prod

# Frontend
cd frontend && npm run build && npm start
```

Set `NEXT_PUBLIC_API_URL` to your deployed API URL and `FRONTEND_URL` to your deployed site URL.

---

## 📝 Notes
- The seed script is **idempotent** — safe to re-run; it upserts by slug/email.
- Import cost (`cost`) is stored per product for margin tracking but **never exposed** to the storefront API.
- Built and verified on Node 22; both `npm run build` commands pass cleanly.
# GadgetGhor
