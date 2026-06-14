const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const {
  createLoan, getLoans, getLoan, approveLoan, rejectLoan, disburseLoan,
} = require('../controllers/loan.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const auditLog = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',    getLoans);
router.get('/:id', getLoan);

router.post('/',
  [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Loan amount must be greater than 0'),
    body('interestRate').isFloat({ gt: 0 }).withMessage('Interest rate must be greater than 0'),
    body('durationMonths').isInt({ gt: 0 }).withMessage('Duration must be at least 1 month'),
  ],
  validate,
  auditLog('CREATE_LOAN'),
  createLoan
);

router.put('/:id/approve',
  authorize('admin'),
  auditLog('APPROVE_LOAN'),
  approveLoan
);

router.put('/:id/reject',
  authorize('admin'),
  [body('reason').optional().isString()],
  validate,
  auditLog('REJECT_LOAN'),
  rejectLoan
);

router.put('/:id/disburse',
  authorize('admin'),
  auditLog('DISBURSE_LOAN'),
  disburseLoan
);

module.exports = router;
