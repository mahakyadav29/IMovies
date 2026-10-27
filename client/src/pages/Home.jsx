import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [statusFilter, setStatusFilter] = useState('now_showing');

  // Filter options loaded from database
  const [genreOptions, setGenreOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, selectedLanguage, statusFilter]);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        genre: selectedGenre !== 'all' ? selectedGenre : undefined,
        language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
        limit: 24,
      };

      const res = await movieService.getMovies(params);
      setMovies(res.movies || []);

      if (res.filters) {
        if (res.filters.genres?.length) setGenreOptions(res.filters.genres);
        if (res.filters.languages?.length) setLanguageOptions(res.filters.languages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setStatusFilter('all');
    setTimeout(() => {
      fetchMovies();
    }, 0);
  };

  const hasActiveFilters =
    search.trim() !== '' || selectedGenre !== 'all' || selectedLanguage !== 'all' || statusFilter !== 'all';

  return (
    <div className="container py-4 flex-grow-1">
      {/* Hero Welcome / Showcase Banner */}
      <div
        className="p-4 p-md-5 mb-4 rounded-4 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #181b24 0%, #10121a 100%)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="col-lg-8">
            <span
              className="badge bg-danger mb-2 px-3 py-2 text-uppercase fw-semibold"
              style={{ letterSpacing: '1px', fontSize: '0.7rem' }}
            >
              Cinema Experience Redefined
            </span>
            <h1 className="display-5 fw-extrabold text-white mb-2">Book Your Favorite Movies</h1>
            <p className="text-secondary lead fs-6 mb-4" style={{ maxWidth: '600px' }}>
              Explore trending releases, select premium seats with real-time availability, and enjoy seamless ticket
              booking across top multiplexes.
            </p>

            {/* Quick Search Form */}
            <form onSubmit={handleSearchSubmit} className="d-flex gap-2" style={{ maxWidth: '520px' }}>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search movie title or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-imovies-primary px-4">
                Search
              </button>
            </form>
          </div>

          <div className="col-lg-4 d-none d-lg-block text-end">
            <div
              className="d-inline-flex flex-column align-items-center justify-content-center p-4 rounded-3 text-center"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <i className="bi bi-ticket-perforated-fill text-danger fs-1 mb-2"></i>
              <span className="text-white fw-bold small">Instant E-Ticket Booking</span>
              <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                Simulated zero-hassle checkout
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Status Bar */}
      <div
        className="p-3 mb-4 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Status Toggle Buttons */}
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('all')}
          >
            All Movies
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'now_showing' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('now_showing')}
          >
            Now Showing
          </button>
          <button
            type="button"
            className={`btn btn-sm ${statusFilter === 'coming_soon' ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter('coming_soon')}
          >
            Coming Soon
          </button>
        </div>

        {/* Filter Dropdowns */}
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Genre Select */}
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="all">All Genres</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Language Select */}
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="all">All Languages</option>
            {languageOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button className="btn btn-sm btn-outline-danger" onClick={handleClearFilters} title="Clear all filters">
              <i className="bi bi-x-circle me-1"></i> Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Movie Listing Grid */}
      {error && <ErrorAlert message={error} onRetry={fetchMovies} />}

      {loading ? (
        <LoadingSpinner message="Fetching movies from cinema database..." />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No movies found"
          message="We could not find any movies matching your current filters. Try searching with different keywords or reset your filters."
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="row g-3">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
