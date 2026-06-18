# 🛍️ Zyra — Full-Stack E-Commerce Platform

A production-ready clothing brand e-commerce app built with **React + Vite + TailwindCSS**, **Express.js**, **MongoDB**, **Stripe**, and **Cloudinary**.

---

## 📁 Project Structure

```
zyra/
├── client/          # React 19 + Vite + TypeScript + TailwindCSS v4
│   ├── src/
│   │   ├── components/   # Navbar, Footer, CartDrawer, ProductCard
│   │   ├── pages/        # All public + account pages
│   │   │   └── admin/    # Admin dashboard pages
│   │   ├── store/        # Zustand (auth, cart, wishlist)
│   │   ├── lib/          # Axios instance (with refresh token)
│   │   └── types/        # TypeScript interfaces
│   └── .env.example
└── server/          # Express.js + TypeScript + Mongoose
    ├── src/
    │   ├── config/       # DB, Cloudinary
    │   ├── models/       # 8 Mongoose models
    │   ├── controllers/  # 10 controllers
    │   ├── routes/       # 10 route files
    │   └── middleware/   # auth, rateLimiter, validate, errorHandler
    └── .env.example
```

---

## ⚙️ Setup Instructions

### 1. Clone / Open the project

```bash
cd "d:/web dev/AntigravityProjects/zyra"
```

### 2. Configure environment variables

**Server:**

```bash
cp server/.env.example server/.env
# Fill in: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET,
#          CLOUDINARY_*, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
```

**Client:**

```bash
cp client/.env.example client/.env
# Fill in: VITE_STRIPE_PUBLISHABLE_KEY
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run in development

Open **two terminals**:

```bash
# Terminal 1 — API server (port 5000)
cd server
npm run dev

# Terminal 2 — React client (port 5173)
cd client
npm run dev
```

Visit **http://localhost:5173**

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable                | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `PORT`                  | API port (default `5000`)                       |
| `MONGO_URI`             | MongoDB Atlas connection string                 |
| `JWT_SECRET`            | Access token secret (min 32 chars)              |
| `JWT_REFRESH_SECRET`    | Refresh token secret                            |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                              |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                           |
| `STRIPE_SECRET_KEY`     | Stripe secret key (`sk_test_...`)               |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret                   |
| `CLIENT_URL`            | Frontend URL for CORS (`http://localhost:5173`) |

### Client (`client/.env`)

| Variable                      | Description                            |
| ----------------------------- | -------------------------------------- |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

---

## 🧪 Stripe Test Cards

| Card      | Number                |
| --------- | --------------------- |
| Success   | `4242 4242 4242 4242` |
| Decline   | `4000 0000 0000 0002` |
| 3D Secure | `4000 0027 6000 3184` |

Use any future expiry, any 3-digit CVC.

---

## 🔌 API Endpoints

| Method | Route                   | Auth   |
| ------ | ----------------------- | ------ |
| POST   | `/api/auth/register`    | —      |
| POST   | `/api/auth/login`       | —      |
| POST   | `/api/auth/logout`      | —      |
| POST   | `/api/auth/refresh`     | —      |
| GET    | `/api/products`         | —      |
| GET    | `/api/products/:slug`   | —      |
| POST   | `/api/products`         | Admin  |
| GET    | `/api/cart`             | User   |
| POST   | `/api/cart`             | User   |
| POST   | `/api/orders`           | User   |
| GET    | `/api/orders/mine`      | User   |
| GET    | `/api/orders`           | Admin  |
| POST   | `/api/coupons/validate` | User   |
| GET    | `/api/admin/stats`      | Admin  |
| POST   | `/api/upload`           | Admin  |
| POST   | `/api/payments/webhook` | Stripe |

---

## 🚀 Deployment

### Frontend → Vercel

```bash
cd client
npm run build    # Creates dist/
```

1. Push `client/` to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set **Root Directory** = `client`
4. Add env var: `VITE_STRIPE_PUBLISHABLE_KEY`

### Backend → Railway / Render

1. Push `server/` to GitHub
2. Create a new service on [railway.app](https://railway.app) or [render.com](https://render.com)
3. Set **Build Command**: `npm run build`
4. Set **Start Command**: `npm start`
5. Add all env vars from `server/.env`
6. Update `CLIENT_URL` to your Vercel domain

### Stripe Webhooks (Production)

```bash
stripe listen --forward-to https://your-api.railway.app/api/payments/webhook
```

Or configure in the Stripe Dashboard → Developers → Webhooks.

---

## 🛡️ Creating the First Admin

1. Register a normal account via `/register`
2. Connect to MongoDB Atlas and run:

```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } });
```

3. Log in → you'll be redirected to `/admin`

---

## 🎨 Tech Stack

| Layer      | Tech                             |
| ---------- | -------------------------------- |
| Frontend   | React 19, Vite 7, TypeScript     |
| Styling    | TailwindCSS v4                   |
| State      | Zustand + persist                |
| Routing    | React Router v6                  |
| Animations | Framer Motion                    |
| Charts     | Recharts                         |
| HTTP       | Axios (with refresh queue)       |
| Backend    | Express.js + TypeScript          |
| Database   | MongoDB + Mongoose               |
| Auth       | JWT + HttpOnly refresh cookie    |
| Payments   | Stripe (PaymentIntents)          |
| Images     | Cloudinary                       |
| Security   | Helmet, CORS, express-rate-limit |
