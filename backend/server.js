const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Request logging ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/customers',    require('./routes/customer.routes'));
app.use('/api/accounts',     require('./routes/account.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/loans',        require('./routes/loan.routes'));
app.use('/api/repayments',   require('./routes/repayment.routes'));
app.use('/api/branches',     require('./routes/branch.routes'));
app.use('/api/reports',      require('./routes/report.routes'));
app.use('/api/audit',        require('./routes/audit.routes'));

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'COMPOUND API', version: '1.0.0' });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 COMPOUND API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
