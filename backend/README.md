# COMPOUND Backend API

> Savings & Loan Management System — Node.js / Express / MongoDB

---

## Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Runtime     | Node.js 18+                         |
| Framework   | Express.js                          |
| Database    | MongoDB (Mongoose ODM)              |
| Auth        | JWT (jsonwebtoken) + bcryptjs       |
| Email       | Nodemailer                          |
| SMS         | Twilio (optional, dev logs fallback)|
| Validation  | express-validator                   |

---

## Project Structure

```
compound-backend/
├── server.js                  # Entry point
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── auth.controller.js
│   ├── branch.controller.js
│   ├── customer.controller.js
│   ├── account.controller.js
│   ├── transaction.controller.js
│   ├── loan.controller.js
│   ├── repayment.controller.js
│   ├── report.controller.js
│   └── audit.controller.js
├── middleware/
│   ├── auth.middleware.js     # JWT protect + role authorize
│   ├── audit.middleware.js    # Auto action logging
│   └── validate.middleware.js # express-validator handler
├── models/
│   ├── user.model.js
│   ├── branch.model.js
│   ├── customer.model.js
│   ├── account.model.js
│   ├── transaction.model.js
│   ├── loan.model.js
│   ├── repayment.model.js
│   └── auditLog.model.js
├── routes/
│   ├── auth.routes.js
│   ├── branch.routes.js
│   ├── customer.routes.js
│   ├── account.routes.js
│   ├── transaction.routes.js
│   ├── loan.routes.js
│   ├── repayment.routes.js
│   ├── report.routes.js
│   └── audit.routes.js
├── services/
│   ├── email.service.js       # Nodemailer templates
│   ├── sms.service.js         # Twilio templates
│   └── notification.service.js# Unified dispatcher
└── utils/
    ├── jwt.utils.js
    ├── loan.utils.js          # Interest & penalty calculations
    └── response.utils.js      # Standardised API responses
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, email & Twilio credentials
```

### 3. Run in development
```bash
npm run dev
```

### 4. Run in production
```bash
npm start
```

---

## Environment Variables

| Variable               | Description                              |
|------------------------|------------------------------------------|
| `PORT`                 | Server port (default: 5000)              |
| `NODE_ENV`             | `development` or `production`            |
| `MONGO_URI`            | MongoDB connection string                |
| `JWT_SECRET`           | Secret key for JWT signing               |
| `JWT_EXPIRE`           | Token expiry e.g. `7d`                   |
| `EMAIL_HOST`           | SMTP host e.g. `smtp.gmail.com`          |
| `EMAIL_PORT`           | SMTP port e.g. `587`                     |
| `EMAIL_USER`           | SMTP username                            |
| `EMAIL_PASS`           | SMTP password / app password             |
| `EMAIL_FROM`           | Sender name + address                    |
| `TWILIO_ACCOUNT_SID`   | Twilio Account SID                       |
| `TWILIO_AUTH_TOKEN`    | Twilio Auth Token                        |
| `TWILIO_PHONE_NUMBER`  | Twilio sender phone number               |

> **SMS in development:** If Twilio is not installed or credentials are missing, SMS messages are logged to the console instead of sending. No setup required to run locally.

---

## API Reference

### Authentication
| Method | Endpoint                     | Access       | Description          |
|--------|------------------------------|--------------|----------------------|
| POST   | `/api/auth/register`         | Admin        | Register a user      |
| POST   | `/api/auth/login`            | Public       | Login                |
| GET    | `/api/auth/me`               | Private      | Get current user     |
| PUT    | `/api/auth/change-password`  | Private      | Change password      |

### Branches
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| GET    | `/api/branches`       | Private | List branches      |
| GET    | `/api/branches/:id`   | Private | Get branch         |
| POST   | `/api/branches`       | Admin   | Create branch      |
| PUT    | `/api/branches/:id`   | Admin   | Update branch      |
| DELETE | `/api/branches/:id`   | Admin   | Deactivate branch  |

### Customers
| Method | Endpoint                        | Access  | Description          |
|--------|---------------------------------|---------|----------------------|
| GET    | `/api/customers`                | Private | List customers       |
| GET    | `/api/customers/:id`            | Private | Get customer         |
| GET    | `/api/customers/:id/summary`    | Private | Full summary         |
| POST   | `/api/customers`                | Private | Create customer      |
| PUT    | `/api/customers/:id`            | Private | Update customer      |
| DELETE | `/api/customers/:id`            | Admin   | Deactivate customer  |

### Accounts
| Method | Endpoint                            | Access  | Description            |
|--------|-------------------------------------|---------|------------------------|
| GET    | `/api/accounts`                     | Private | List accounts          |
| GET    | `/api/accounts/:id`                 | Private | Get account            |
| GET    | `/api/accounts/customer/:id`        | Private | Accounts by customer   |
| POST   | `/api/accounts`                     | Private | Create account         |

### Transactions
| Method | Endpoint                        | Access  | Description       |
|--------|---------------------------------|---------|-------------------|
| GET    | `/api/transactions`             | Private | List transactions |
| GET    | `/api/transactions/:id`         | Private | Get transaction   |
| POST   | `/api/transactions/deposit`     | Private | Deposit funds     |
| POST   | `/api/transactions/withdraw`    | Private | Withdraw funds    |

### Loans
| Method | Endpoint                   | Access  | Description        |
|--------|----------------------------|---------|--------------------|
| GET    | `/api/loans`               | Private | List loans         |
| GET    | `/api/loans/:id`           | Private | Get loan           |
| POST   | `/api/loans`               | Private | Apply for loan     |
| PUT    | `/api/loans/:id/approve`   | Admin   | Approve loan       |
| PUT    | `/api/loans/:id/reject`    | Admin   | Reject loan        |
| PUT    | `/api/loans/:id/disburse`  | Admin   | Disburse loan      |

### Repayments
| Method | Endpoint                        | Access  | Description             |
|--------|---------------------------------|---------|-------------------------|
| GET    | `/api/repayments`               | Private | List repayments         |
| GET    | `/api/repayments/loan/:loanId`  | Private | Repayments for a loan   |
| POST   | `/api/repayments`               | Private | Record repayment        |

### Reports
| Method | Endpoint                              | Access  | Description              |
|--------|---------------------------------------|---------|--------------------------|
| GET    | `/api/reports/overview`               | Private | Dashboard stats          |
| GET    | `/api/reports/transactions`           | Private | Transaction summary      |
| GET    | `/api/reports/loans`                  | Private | Loan portfolio report    |
| GET    | `/api/reports/statement/:customerId`  | Private | Customer statement       |

### Audit Logs
| Method | Endpoint      | Access | Description     |
|--------|---------------|--------|-----------------|
| GET    | `/api/audit`  | Admin  | View audit logs |

---

## Response Format

All endpoints return a consistent JSON structure:

```json
// Success
{ "success": true, "message": "...", "data": { } }

// Paginated
{ "success": true, "count": 20, "total": 120, "page": 1, "totalPages": 6, "data": [] }

// Error
{ "success": false, "message": "..." }

// Validation error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }
```

---

## Key Design Decisions

- **MongoDB sessions** — deposits, withdrawals, and repayments use atomic transactions to prevent balance inconsistencies if a write fails mid-operation.
- **Soft deletes** — customers, accounts, and branches are deactivated (`isActive: false`) rather than permanently deleted to preserve financial history.
- **Branch-scoped access** — staff can only see and operate on data belonging to their own branch; admins have full visibility across all branches.
- **Notifications fire async** — SMS and email are dispatched after the HTTP response is sent so a failing notification never blocks or rolls back a financial operation.
- **Immutable audit logs** — the `AuditLog` model blocks all update and delete operations at the Mongoose middleware level.
- **Flat interest** — loan calculations use the flat-rate method standard in microfinance: `Total Interest = Principal × Rate × (Months / 12)`.

---

## Deployment

### MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist your server IP
3. Copy the connection string into `MONGO_URI`

### DigitalOcean / AWS EC2
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name compound-api

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Environment checklist before going live
- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ random characters)
- [ ] MongoDB Atlas IP whitelist set
- [ ] HTTPS enforced (via Nginx reverse proxy or load balancer)
- [ ] Email credentials tested
- [ ] Twilio credentials added and verified
