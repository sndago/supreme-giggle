const express = require('express');
const router  = express.Router();
const {
  getOverview, getTransactionSummary, getLoanReport, getCustomerStatement,
} = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/overview',                    getOverview);
router.get('/transactions',                getTransactionSummary);
router.get('/loans',                       getLoanReport);
router.get('/statement/:customerId',       getCustomerStatement);

module.exports = router;
