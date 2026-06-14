# COMPOUND Banking System

A professional Savings & Loan Management System built with Node.js, Express, MongoDB, and React.

## 📋 Project Overview

COMPOUND is a comprehensive banking system designed to manage:
- Customer accounts (savings & current)
- Loan applications and management
- Loan repayments and tracking
- Transaction history
- Multi-branch operations
- Audit logging

## 📁 Project Structure

```
kona/
├── backend/                 # Express.js REST API
│   ├── config/             # Database configuration
│   ├── controllers/        # Business logic handlers
│   ├── middleware/         # Auth, validation, audit
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── services/           # Email, SMS, notifications
│   ├── utils/              # JWT, loan calculations, helpers
│   ├── server.js           # Entry point
│   └── package.json        # Dependencies
├── frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (auth)
│   │   ├── services/       # API client configuration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   ├── constants/      # App constants
│   │   ├── config/         # Frontend configuration
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # Entry point
│   └── package.json        # Dependencies
├── scripts/                # Utility scripts
│   └── seed.js             # Database seeder
├── docs/                   # Documentation
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kona
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other configurations
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
```

### Running the Application

**Terminal 1 - Backend API**
```bash
cd backend
npm run dev
```
API runs on `http://localhost:3000`

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📊 Available Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm run seed       # Seed database with sample data
npm run seed:fresh # Clear and seed database
npm run seed:wipe  # Clear database only
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🔐 Authentication

### Demo Credentials

**Admin Account:**
- Email: `admin@compound.bank`
- Password: `Admin@1234`

**Staff Account:**
- Email: `kofi.teller@compound.bank`
- Password: `Staff@2024`

*(Run `npm run seed` to generate complete demo credentials)*

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + bcryptjs
- **Validation:** express-validator
- **Email:** Nodemailer
- **SMS:** Twilio (optional)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Framework:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Charts:** Recharts

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/compound
PORT=3000
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=7d
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=/api
```

## 🏗 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

Serve the `frontend/dist` folder with a web server or CDN.

## 📖 API Documentation

All API endpoints are prefixed with `/api`:

- `/api/auth` - Authentication endpoints
- `/api/customers` - Customer management
- `/api/accounts` - Account operations
- `/api/transactions` - Transaction history
- `/api/loans` - Loan management
- `/api/repayments` - Repayment tracking
- `/api/branches` - Branch management
- `/api/reports` - Business reports
- `/api/audit` - Audit logs

## 🔄 Database Seeding

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 3 branches (Accra, Kumasi, Takoradi)
- 8 users (2 admins + 6 staff)
- 12 customers
- 18 accounts with balances
- 29 transactions
- 12 loans in various states
- 40+ loan repayments

## 📋 Requirements for Deployment

- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] Backend API running successfully
- [ ] Frontend build optimized (`npm run build`)
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Database backups scheduled
- [ ] Error logging setup
- [ ] Monitoring tools configured

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs (12 rounds)
- Role-based access control (Admin/Staff)
- Audit logging for all actions
- Request validation and sanitization
- CORS protection
- HTTP-only token storage

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive breakpoints: sm, md, lg, xl
- Touch-friendly interface
- Works on all modern browsers

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env
- Verify network access if using Atlas

### Port Already in Use
```bash
# Backend (default 3000)
lsof -i :3000
kill -9 <PID>

# Frontend (default 5173)
lsof -i :5173
kill -9 <PID>
```

### Frontend not connecting to API
- Check proxy in `frontend/vite.config.js`
- Ensure backend is running on port 3000
- Check CORS configuration in backend

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Check MongoDB connection
4. Verify all environment variables

## 📄 License

ISC License

---

**Last Updated:** June 2026
**Version:** 1.0.0
