const express = require('express');
const router = express.Router();
const {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
  deleteTheatre,
} = require('../controllers/theatreController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', getTheatres);
router.get('/:id', getTheatreById);

// Admin-only protected routes
router.post('/', verifyToken, requireAdmin, createTheatre);
router.put('/:id', verifyToken, requireAdmin, updateTheatre);
router.delete('/:id', verifyToken, requireAdmin, deleteTheatre);

module.exports = router;
