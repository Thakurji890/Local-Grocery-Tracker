# GrocerIQ - Local Grocery Bill Tracker & POS System

A high-performance, production-ready full-stack billing, inventory, and point-of-sale system tailored specifically for Indian grocery (Kirana) stores. It seamlessly generates beautiful PDF receipts and structures financial exports directly into the Indian government (GSTR-1) CSV format.

## Technology Stack
- **Frontend**: React.js with Vite, Tailwind CSS (Vanilla utilities), React Router Dom
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Security**: JWT tokens, bcrypt.js for role-based authentication

## Features
- **Smart Authentication**: Role-based routing spanning Admins, Cashiers (Staff), and Authority roles.
- **Premium User Interface**: State-of-the-art UI utilizing dynamic animations, sleek glassmorphism, and optimal HSL Emerald-tailored aesthetics perfectly suited for grocery operations. 
- **Lightning Fast Point of Sale**: Real-time cart calculations, intelligent stock tracking, and instantaneous quantity caps using efficient React Context handling.
- **Digital Receipts**: High fidelity, cleanly structured PDF generation dynamically crafted with jsPDF based directly on transaction nodes.
- **GST Compliance Engine**: Inbuilt multi-tier GST (0%, 5%, 12%, 18%) logic engine auto-calculating exact CGST/SGST splits perfectly formatted for the Indian taxation infrastructure.
- **Data Exporting**: 1-click generation of the GSTR-1 compliant CSV ready for upload to CA portals or government gateways.

## Getting Started

### 1. Database Configuration
By default, the application runs on a local mongodb instance. Ensure you have MongoDB running locally, or replace the URI in `backend/.env`.

### 2. Run Backend
```bash
cd backend
npm install
npm run dev # or node server.js
```
The node server will ignite on `http://localhost:5500`.

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Usage
Finally, access `http://localhost:5173`. We haven't seeded data initially, so you will need to utilize Postman to construct your first `Admin` token profile via `http://localhost:5500/api/auth/register` or use the new Signup page.

## WhatsApp Integration Notice
This codebase is primed for web-hook based integrations (like Twilio / WATI for WhatsApp receipts). You can expand upon `backend/controllers/billController.js` and pipe `billNumber` along with formatted text into a provider's API successfully post checkout.

## Deployment Guide
- **Vercel** / **Netlify**: Hook up your repository, frame the build settings as `Vite` -> `npm run build` targeting the `frontend` root. 
- **Render** / **Railway**: Connect the `backend/server.js` executing a Node environment, configure your `.env` variables there with an updated `MONGODB_URI` mapping to a MongoDB Atlas cluster.
