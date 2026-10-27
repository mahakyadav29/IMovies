const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @route   GET /api/movies
// @desc    Get all movies with search, filter, and pagination
// @access  Public
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, page = 1, limit = 12 } = req.query;

    const query = {};

    // Search by title or description
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by genre
    if (genre && genre !== 'all') {
      query.genre = { $in: [new RegExp(`^${genre.trim()}$`, 'i')] };
    }

    // Filter by language
    if (language && language !== 'all') {
      query.language = { $in: [new RegExp(`^${language.trim()}$`, 'i')] };
    }

    // Filter by status (now_showing, coming_soon)
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ releaseDate: -1 }).skip(skip).limit(limitNum),
      Movie.countDocuments(query),
    ]);

    // Distinct values for filter dropdowns
    const [allGenres, allLanguages] = await Promise.all([
      Movie.distinct('genre'),
      Movie.distinct('language'),
    ]);

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      filters: {
        genres: allGenres.sort(),
        languages: allLanguages.sort(),
      },
      movies,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/movies/:id
// @desc    Get single movie by ID with upcoming shows
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Fetch shows associated with this movie
    const todayStr = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movie: movie._id,
      isActive: true,
      showDate: { $gte: todayStr },
    })
      .populate('theatre', 'name location address')
      .sort({ showDate: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      movie,
      shows,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/movies
// @desc    Create a new movie
// @access  Admin only
const createMovie = async (req, res, next) => {
  try {
    const {
      title,
      description,
      genre,
      language,
      duration,
      releaseDate,
      posterUrl,
      bannerUrl,
      trailerUrl,
      rating,
      cast,
      director,
      status,
      certificate,
    } = req.body;

    // Validate required fields
    if (!title || !description || !duration || !releaseDate || !posterUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, duration, releaseDate, posterUrl.',
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      genre: Array.isArray(genre) ? genre : String(genre).split(',').map((g) => g.trim()),
      language: Array.isArray(language) ? language : String(language).split(',').map((l) => l.trim()),
      duration: Number(duration),
      releaseDate: new Date(releaseDate),
      posterUrl: posterUrl.trim(),
      bannerUrl: bannerUrl ? bannerUrl.trim() : '',
      trailerUrl: trailerUrl ? trailerUrl.trim() : '',
      rating: rating ? Number(rating) : 0,
      cast: Array.isArray(cast) ? cast : cast ? String(cast).split(',').map((c) => c.trim()) : [],
      director: director ? director.trim() : '',
      status: status || 'now_showing',
      certificate: certificate || 'UA',
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully!',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/movies/:id
// @desc    Update an existing movie
// @access  Admin only
const updateMovie = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.genre && !Array.isArray(updateData.genre)) {
      updateData.genre = String(updateData.genre).split(',').map((g) => g.trim());
    }
    if (updateData.language && !Array.isArray(updateData.language)) {
      updateData.language = String(updateData.language).split(',').map((l) => l.trim());
    }
    if (updateData.cast && !Array.isArray(updateData.cast)) {
      updateData.cast = String(updateData.cast).split(',').map((c) => c.trim());
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully!',
      movie,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/movies/:id
// @desc    Delete movie (and cascade check shows)
// @access  Admin only
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    // Check if there are active shows for this movie
    const showsCount = await Show.countDocuments({ movie: movie._id, isActive: true });
    if (showsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete movie because it currently has ${showsCount} active show(s). Please remove or deactivate those shows first.`,
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
