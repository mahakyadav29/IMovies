const express = require('express');
const router = express.Router();
const {
  getShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
} = require('../controllers/showController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', getShows);
router.get('/:id', getShowById);

// Admin-only protected routes
router.post('/', verifyToken, requireAdmin, createShow);
router.put('/:id', verifyToken, requireAdmin, updateShow);
router.delete('/:id', verifyToken, requireAdmin, deleteShow);

module.exports = router;
