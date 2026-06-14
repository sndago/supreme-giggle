const express = require('express');
const router  = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);

module.exports = router;
