# Shop Nova ✨

A premium e-commerce store built for the **CodeAlpha Internship — Task 1 (Simple E-commerce Store)**. React + TypeScript frontend with an Express + MongoDB backend, wrapped in an aurora-gradient, animated UI designed to stand out as a portfolio piece.

## Live Demo Accounts

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | `admin@shopnova.com` | `Admin@123` |
| User  | `ravi@mail.com`      | `Ravi@1234` |

## Features

- ✅ Product listing with **search**, **category filter** & **pagination**
- ✅ Product detail page with stock, rating & **customer reviews**
- ✅ Shopping cart — sliding **cart drawer**, quantity controls, live totals
- ✅ Checkout (address + COD/UPI/Card) & **order placement**
- ✅ Order history & per-order status timeline
- ✅ User registration / login (JWT + bcrypt)
- ✅ Admin panel — product CRUD, image upload, order status management
- ✅ Shop Nova design system — glassmorphism, gradients, Three.js hero, page transitions, confetti, toasts, skeleton loaders
- ✅ Fully responsive (bottom nav + hamburger on mobile)

## Tech Stack

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · Framer Motion · GSAP · Three.js · Zustand · React Router · Axios
**Backend:** Node.js · Express · Mongoose · JWT · bcryptjs · multer · (optional) Cloudinary
**Database:** MongoDB (Atlas or local) — falls back to an in-memory MongoDB for out-of-the-box demos

## Folder Structure

```
aurora-glass-commerce/
├── backend/                  # Express API
│   ├── config/db.js          # MongoDB connection (memory-DB fallback)
│   ├── controllers/          # auth, product, cart, order, admin, upload
│   ├── middleware/           # auth (JWT/role), error handling
│   ├── models/               # User, Product, Cart, Order
│   ├── routes/
│   ├── utils/seed.js         # sample catalog + demo accounts
│   ├── scripts/              # SVG image generator
│   └── server.js
├── frontend/                 # React + Vite SPA
│   ├── src/pages/            # all routes (incl. admin/)
│   ├── src/components/       # Navbar, CartDrawer, ProductCard, Hero, …
│   ├── src/context/          # Zustand stores (auth, cart)
│   └── src/lib/              # api client, types
└── README.md
```

## Quick Start (out of the box)

```bash
# 1. Backend — uses an in-memory MongoDB automatically if MONGO_URI is unset
cd backend
npm install
npm run dev            # http://localhost:5000

# 2. Frontend (new terminal)
cd ../frontend
npm install
npm run dev            # http://localhost:5173
```

> On first run the backend downloads a local MongoDB binary (~600 MB) for the in-memory database. To use your own MongoDB instead, create `backend/.env` from `.env.example` and set `MONGO_URI`.

## Pointing at a Real MongoDB

```bash
cd backend
cp .env.example .env    # then edit MONGO_URI + JWT_SECRET
npm run seed            # optional: seed catalog + demo accounts
npm run dev
```

Seeding is automatic when the connected database is empty (or when `SEED_ON_START=true`).

## Admin Image Upload

`/admin/products/new` lets an admin upload an image. With `CLOUDINARY_*` env vars set, images go to **Cloudinary**; otherwise they're stored in `backend/uploads` and served from `/uploads`. The core app works fine with either.

## API Overview

| Method | Endpoint                  | Auth    | Description                        |
|--------|---------------------------|---------|------------------------------------|
| POST   | `/api/register`           | —       | Create account                     |
| POST   | `/api/login`              | —       | Login → JWT                        |
| GET    | `/api/profile`            | JWT     | Current user                       |
| GET    | `/api/products`           | —       | List (search/category/page)        |
| GET    | `/api/product/:id`        | —       | Product details                    |
| POST   | `/api/product`            | Admin   | Create product                     |
| PUT    | `/api/product/:id`        | Admin   | Update product                     |
| DELETE | `/api/product/:id`        | Admin   | Delete product                     |
| POST   | `/api/product/:id/review` | JWT     | Add review/rating                  |
| GET    | `/api/cart`               | JWT     | Get cart                           |
| POST   | `/api/cart`               | JWT     | Add to cart                        |
| PUT    | `/api/cart/:id`           | JWT     | Update quantity                    |
| DELETE | `/api/cart/:id`           | JWT     | Remove item                        |
| POST   | `/api/order`              | JWT     | Place order (clears cart)          |
| GET    | `/api/orders`             | JWT     | Order history                      |
| GET    | `/api/orders/:id`         | JWT     | Order detail                       |
| GET    | `/api/admin/stats`        | Admin   | Dashboard stats                    |
| GET    | `/api/admin/orders`       | Admin   | All orders (?status=)              |
| PUT    | `/api/admin/order/:id/status` | Admin | Update order status               |
| POST   | `/api/upload`             | Admin   | Upload product image               |

## Security

- Passwords hashed with **bcrypt** (cost 10) — never stored or returned in plaintext
- **JWT** stateless auth, 7-day expiry, `Authorization: Bearer` header
- **Role guards** on all admin/product-mutation routes
- Server-side validation on every mutating endpoint; rate limiting on auth routes
- `helmet` security headers, CORS restricted to the frontend origin
- Secrets via `.env` only — `.env` is gitignored, `.env.example` committed

## Deployment

- **Frontend** → Vercel (env: `VITE_API_URL` = backend URL)
- **Backend** → Render (env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`)
- **Database** → MongoDB Atlas (M0 free tier)
- **Images** → Cloudinary (optional)

## License

Built as an internship submission. Free to use and adapt.
