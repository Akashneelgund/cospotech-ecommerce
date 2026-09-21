# 🕉️ Cospotech — Luxury Consecrated Spiritual E-Commerce Platform

> Production-grade, editorial luxury D2C e-commerce platform built on **71 authentic consecrated spiritual products** with full-stack TypeScript architecture, instant search, responsive UI, devotion rewards, order tracking, and enterprise admin suite.

---

## 🌟 Architecture & Features

- **Storefront**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, PWA Support.
- **Backend API**: Node.js, Express, TypeScript, Prisma ORM, Helmet security, JWT auth.
- **Product Catalog**: 71 authentic items (0001–0071), 82 variants, sacred categories (Yantras, Gemstones, Chowkis, Malas).
- **Checkout & Orders**: Razorpay/UPI payment simulator, order tracking timeline, PDF invoice generation.
- **Devotee Rewards**: Vedic Coins loyalty points, referral engine, WhatsApp support concierge.
- **Admin Control Suite**: Analytics dashboard, inventory management, banners CMS, flash sales scheduler, abandoned cart recovery, Excel import/export.

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@vedicveda.com` | `Admin@12345` | Full Command: Dashboard, Funnel Analytics, Inventory, Orders, Banners CMS, Flash Sales |
| **Operations Staff** | `staff@vedicveda.com` | `Staff@12345` | Order fulfillment, Courier dispatch, Inventory adjustments |
| **Devotee / Customer** | `customer@vedicveda.com` | `Customer@12345` | Orders tracking timeline, Vedic Coins loyalty points |

*(1-Click Demo Sign-In Buttons are also available on the Login page)*

---

## 🚀 Local Quick Start

```bash
# 1. Install & build all dependencies
npm run install:all

# 2. Start Backend (Port 5000)
npm run dev:backend

# 3. Start Frontend (Port 5173)
npm run dev:frontend
```

---

## ☁️ Deployment on Render

This repository includes a `render.yaml` blueprint for automatic deployment on [Render](https://render.com).

1. Connect this GitHub repository on Render.
2. Render detects `render.yaml` as a Web Service.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. The unified service builds the React frontend and serves both the API (`/api/*`) and static client on one live URL.

---

## 📄 License
MIT © 2026 Akash Neelgund
