const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const {
  createCustomer, getCustomers, getCustomer, updateCustomer,
  deleteCustomer, getCustomerSummary,
} = require('../controllers/customer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const auditLog = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',     getCustomers);
router.get('/:id',  getCustomer);
router.get('/:id/summary', getCustomerSummary);

router.post('/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('idType').notEmpty().withMessage('ID type is required'),
    body('idNumber').notEmpty().withMessage('ID number is required'),
    body('branch').notEmpty().withMessage('Branch is required'),
  ],
  validate,
  auditLog('CREATE_CUSTOMER'),
  createCustomer
);

router.put('/:id',    auditLog('UPDATE_CUSTOMER'), updateCustomer);
router.delete('/:id', authorize('admin'), auditLog('DELETE_CUSTOMER'), deleteCustomer);

module.exports = router;
