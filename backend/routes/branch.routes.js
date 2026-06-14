const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const { createBranch, getBranches, getBranch, updateBranch, deleteBranch } = require('../controllers/branch.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate   = require('../middleware/validate.middleware');
const auditLog   = require('../middleware/audit.middleware');

router.use(protect);

router.get('/',     getBranches);
router.get('/:id',  getBranch);

router.post('/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('Branch name is required'),
    body('code').notEmpty().withMessage('Branch code is required'),
  ],
  validate,
  auditLog('CREATE_BRANCH'),
  createBranch
);

router.put('/:id',    authorize('admin'), auditLog('UPDATE_BRANCH'), updateBranch);
router.delete('/:id', authorize('admin'), auditLog('DELETE_BRANCH'), deleteBranch);

module.exports = router;
