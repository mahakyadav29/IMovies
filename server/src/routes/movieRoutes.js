const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { verifyToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', getMovies);
router.get('/:id', getMovieById);

// Admin-only protected routes
router.post('/', verifyToken, requireAdmin, createMovie);
router.put('/:id', verifyToken, requireAdmin, updateMovie);
router.delete('/:id', verifyToken, requireAdmin, deleteMovie);

module.exports = router;
