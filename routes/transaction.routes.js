const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const {
  deposit, withdraw, getTransactions, getTransaction,
} = require('../controllers/transaction.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const auditLog = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',    getTransactions);
router.get('/:id', getTransaction);

router.post('/deposit',
  [
    body('accountId').notEmpty().withMessage('Account ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  ],
  validate,
  auditLog('DEPOSIT'),
  deposit
);

router.post('/withdraw',
  [
    body('accountId').notEmpty().withMessage('Account ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  ],
  validate,
  auditLog('WITHDRAWAL'),
  withdraw
);

module.exports = router;
