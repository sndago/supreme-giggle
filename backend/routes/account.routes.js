const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const {
  createAccount, getAccounts, getAccount, getAccountsByCustomer,
} = require('../controllers/account.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const auditLog = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',                          getAccounts);
router.get('/:id',                       getAccount);
router.get('/customer/:customerId',      getAccountsByCustomer);

router.post('/',
  [
    body('customerId').notEmpty().withMessage('Customer ID is required'),
    body('type').optional().isIn(['savings', 'current']).withMessage('Invalid account type'),
  ],
  validate,
  auditLog('CREATE_ACCOUNT'),
  createAccount
);

module.exports = router;
