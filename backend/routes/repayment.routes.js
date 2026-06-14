const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const {
  createRepayment, getRepayments, getRepaymentsByLoan,
} = require('../controllers/repayment.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const auditLog = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',              getRepayments);
router.get('/loan/:loanId',  getRepaymentsByLoan);

router.post('/',
  [
    body('loanId').notEmpty().withMessage('Loan ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'bank_transfer', 'mobile_money'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  auditLog('RECORD_REPAYMENT'),
  createRepayment
);

module.exports = router;
