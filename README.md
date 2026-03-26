# 🛒 Local Grocery Bill Tracker
### GST-Enabled Billing & Inventory Management for Indian Kirana Stores

A full-stack, production-ready POS and billing system built specifically for kirana stores in India, with proper CGST + SGST calculation, GSTR-1 export, digital receipts, UPI payment support, and role-based access control.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Recharts |
| Backend | Node.js 20 + Express.js |
| Database | MongoDB 7 + Mongoose ORM |
| Auth | JWT (JSON Web Tokens) |
| PDF | jsPDF + jsPDF-AutoTable |
| Logging | Winston |
| Security | Helmet, Rate Limiting, Mongo Sanitize |
| Deployment | Docker + Docker Compose |

---

## 📁 Project Structure

```
grocery-bill-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login, register, user management
│   │   ├── billController.js      # POS billing, GST, stock deduction
│   │   ├── dashboardController.js # Analytics & stats
│   │   ├── productController.js   # CRUD, barcode, categories
│   │   └── reportController.js    # GSTR-1, sales reports
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + role authorization
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   ├── Bill.js                # Bill with CGST/SGST breakup
│   │   ├── Customer.js            # Customer purchase history
│   │   ├── Product.js             # Products with GST slab
│   │   └── User.js                # Users with bcrypt password
│   ├── routes/
│   │   ├── auth.js / bills.js / customers.js
│   │   ├── dashboard.js / products.js / reports.js
│   ├── utils/
│   │   ├── gstCalculator.js       # CGST+SGST engine
│   │   ├── logger.js              # Winston logger
│   │   └── seed.js                # Demo data seeder
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/Sidebar.jsx # Role-filtered navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT auth state management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Auth with demo shortcuts
│   │   │   ├── DashboardPage.jsx  # Analytics + charts
│   │   │   ├── BillingPage.jsx    # Full POS system
│   │   │   ├── ProductsPage.jsx   # Product CRUD
│   │   │   ├── BillsPage.jsx      # Bills history + detail
│   │   │   ├── CustomersPage.jsx  # Customer management
│   │   │   ├── ReportsPage.jsx    # GSTR-1 + sales reports
│   │   │   └── UsersPage.jsx      # User management (admin)
│   │   ├── services/
│   │   │   └── api.js             # Axios + all API calls
│   │   ├── utils/
│   │   │   ├── gst.js             # Frontend GST calculator
│   │   │   └── pdfGenerator.js    # Receipt + GSTR-1 PDF
│   │   ├── App.jsx                # Router + role guards
│   │   └── index.css              # Full design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Setup Guide (Step by Step)

### Prerequisites
- Node.js v18 or higher → https://nodejs.org
- MongoDB (local or Atlas) → https://mongodb.com
- Git → https://git-scm.com

---

### METHOD 1: Local Development (Recommended for beginners)

#### Step 1 — Clone / Download the project

```bash
cd grocery-bill-tracker
```

#### Step 2 — Set up the Backend

```bash
cd backend
```

Copy the environment file:
```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in your values:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/grocery_tracker
JWT_SECRET=your_random_secret_here_make_it_long_and_random
JWT_EXPIRE=7d
STORE_NAME=Your Store Name
STORE_GSTIN=21AABCU9603R1ZV
```

Install backend dependencies:
```bash
npm install
```

#### Step 3 — Start MongoDB

**Option A: Local MongoDB (install from mongodb.com)**
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows — MongoDB should be running as a service
```

**Option B: MongoDB Atlas (free cloud, no install needed)**
1. Go to https://cloud.mongodb.com
2. Create a free account → Create a free cluster
3. Click "Connect" → "Drivers" → copy the connection string
4. Paste it as `MONGO_URI` in your `.env` file
5. Replace `<password>` with your Atlas password

#### Step 4 — Seed the database with demo data

```bash
node utils/seed.js
```

You will see:
```
✅ DB Connected
🗑️  Cleared existing data
👥 Users created
📦 12 products created

✅ Seed complete!
📧 Admin:     admin@store.com     / admin123
📧 Staff:     staff@store.com     / staff123
📧 Authority: authority@store.com / auth123
```

#### Step 5 — Start the backend server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000 in development mode
✅ MongoDB Connected: localhost
```

Test it: open http://localhost:5000/health in your browser. You should see `{"status":"OK"}`

#### Step 6 — Set up the Frontend (new terminal window)

```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Kirana Bill Tracker
VITE_STORE_NAME=Your Store Name Here
VITE_STORE_GSTIN=21AABCU9603R1ZV
VITE_UPI_ID=yourname@upi
```

Install frontend dependencies:
```bash
npm install
```

Start the frontend:
```bash
npm run dev
```

You will see:
```
  VITE v5.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
```

#### Step 7 — Open the app

Go to: **http://localhost:5173**

Login with any demo account:
- 👑 Admin: `admin@store.com` / `admin123`
- 🧑‍💼 Staff: `staff@store.com` / `staff123`
- 🔍 Authority: `authority@store.com` / `auth123`

---

### METHOD 2: Docker (One command setup)

#### Prerequisites
- Docker Desktop → https://www.docker.com/products/docker-desktop

#### Step 1 — Build and run everything

```bash
cd grocery-bill-tracker
docker-compose up --build
```

Wait ~2 minutes for all services to start. You'll see logs from mongo, backend, and frontend.

#### Step 2 — Seed the demo data

In a new terminal:
```bash
docker exec grocery_backend node utils/seed.js
```

#### Step 3 — Open the app

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/health
- MongoDB: localhost:27017

#### Stop everything
```bash
docker-compose down
```

---

## 🌐 Deployment Guide

### Deploy to Render.com (Free) + MongoDB Atlas

#### Backend on Render

1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add Environment Variables (click "Environment"):
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/grocery_tracker
   JWT_SECRET=your_very_long_random_secret_here
   JWT_EXPIRE=7d
   STORE_NAME=Your Store Name
   STORE_GSTIN=21AABCU9603R1ZV
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```
6. Click "Create Web Service"
7. Wait for deployment → copy the URL (e.g. `https://grocery-backend.onrender.com`)

#### Frontend on Vercel

1. Go to https://vercel.com → New Project
2. Import your GitHub repo
3. Set these settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://grocery-backend.onrender.com/api
   VITE_STORE_NAME=Your Store Name
   VITE_STORE_GSTIN=21AABCU9603R1ZV
   VITE_UPI_ID=yourname@upi
   ```
5. Click Deploy → Done!

---

## 🔑 API Reference

### Authentication
```
POST /api/auth/register    Create new user (admin only for admin/authority roles)
POST /api/auth/login       Login, returns JWT token
GET  /api/auth/me          Get current user profile
GET  /api/auth/users       List all users (admin only)
PUT  /api/auth/users/:id/toggle   Activate/deactivate user
```

### Products
```
GET    /api/products              List with search, category, pagination
GET    /api/products/:id          Get single product
GET    /api/products/barcode/:bc  Lookup by barcode
GET    /api/products/categories   All categories
POST   /api/products              Create product (admin/staff)
PUT    /api/products/:id          Update product (admin/staff)
DELETE /api/products/:id          Soft delete (admin only)
```

### Billing
```
POST /api/bills           Create bill (auto GST calc, stock deduction)
GET  /api/bills           List bills with filters + pagination
GET  /api/bills/:id       Get bill with full GST breakup
POST /api/bills/:id/cancel  Cancel bill, restore stock (admin/authority)
```

### Dashboard & Reports
```
GET /api/dashboard/stats       Today + monthly stats, charts, top products
GET /api/reports/gstr1         GSTR-1 monthly summary (JSON or CSV)
GET /api/reports/sales         Date range sales report
```

---

## 👥 Role Permissions Matrix

| Feature | Admin | Staff | Authority |
|---------|-------|-------|-----------|
| Dashboard | ✅ | ✅ | ✅ |
| Create Bills (POS) | ✅ | ✅ | ❌ |
| View Bills | ✅ | Own only | ✅ All |
| Cancel Bills | ✅ | ❌ | ✅ |
| Add Products | ✅ | ✅ | ❌ |
| Delete Products | ✅ | ❌ | ❌ |
| View Customers | ✅ | ✅ | ✅ |
| Reports & GSTR-1 | ✅ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 🧾 GST Calculation Logic

For **intra-state** sales (within same state), GST is split equally:
```
GST Rate: 18%
→ CGST: 9% (goes to Central Govt)
→ SGST: 9% (goes to State Govt)
```

For **GST-inclusive prices** (most kirana items):
```
Item Price: ₹118 (18% GST included)
→ Base Price = 118 / (1 + 18/100) = ₹100
→ CGST = ₹9
→ SGST = ₹9
→ Grand Total = ₹118
```

---

## 📊 Database Collections

```
users        → Staff accounts with hashed passwords and roles
products     → Inventory with GST slab, stock, barcode
bills        → Bills with full CGST/SGST breakup per line item
customers    → Customer profiles with purchase history links
```

---

## 🔐 Security Features

- ✅ JWT authentication with configurable expiry
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Helmet.js for HTTP security headers
- ✅ Express Rate Limiting (100 requests per 15 min)
- ✅ MongoDB injection sanitization
- ✅ CORS whitelist
- ✅ Soft delete (no permanent data loss)
- ✅ Role-based route protection
- ✅ Winston logging with log rotation

---

## 💡 Customization

### Change Store Details
Edit `backend/.env`:
```
STORE_NAME=My Store Name
STORE_ADDRESS=123, MG Road, City - 000000
STORE_PHONE=+91-XXXXXXXXXX
STORE_GSTIN=YOUR_GSTIN_HERE
```

### Add UPI Payment
Edit `frontend/.env`:
```
VITE_UPI_ID=yourname@upi
```

### Enable WhatsApp Receipt (Twilio)
1. Sign up at https://twilio.com
2. Get WhatsApp sandbox credentials
3. Add to `backend/.env`:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## 🐛 Troubleshooting

**"Cannot connect to MongoDB"**
- Check MONGO_URI in .env
- For Atlas: whitelist your IP at network access settings
- For local: ensure `mongod` service is running

**"JWT invalid" errors after restart**
- JWT_SECRET must stay the same between restarts
- Don't use spaces in JWT_SECRET

**Frontend shows blank page**
- Check browser console for errors
- Verify VITE_API_URL points to your running backend

**"Port already in use"**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

---

## 📞 Support

For issues, open a GitHub issue or check the logs:
- Backend logs: `backend/logs/error.log`
- Browser console (F12) for frontend errors

---

*Built with ❤️ for Indian kirana stores. Jai Hind! 🇮🇳*
