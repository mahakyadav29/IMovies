const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/stats', verifyToken, requireAdmin, getDashboardStats);

module.exports = router;
