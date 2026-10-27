import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getMoviePosterPlaceholder } from '../utils/placeholder';
import { formatDate, formatDuration, formatCurrency } from '../utils/formatters';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState('');

  // Selected date filter for shows
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getMovieById(id);
      setMovie(res.movie);
      setImgSrc(res.movie.posterUrl);
      setShows(res.shows || []);

      // Default selected date to first available show date or today
      if (res.shows?.length > 0) {
        setSelectedDate(res.shows[0].showDate);
      } else {
        setSelectedDate(new Date().toISOString().split('T')[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movie details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading movie details and showtimes..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchMovieDetails} /></div>;
  if (!movie) return null;

  // Extract unique show dates for date tabs
  const uniqueDates = Array.from(new Set(shows.map((s) => s.showDate))).sort();

  // Filter shows by selected date
  const filteredShows = shows.filter((s) => s.showDate === selectedDate);

  // Group filtered shows by Theatre
  const theatreMap = new Map();
  filteredShows.forEach((show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!theatreMap.has(theatreId)) {
      theatreMap.set(theatreId, {
        theatre: show.theatre,
        shows: [],
      });
    }
    theatreMap.get(theatreId).shows.push(show);
  });

  return (
    <div className="flex-grow-1">
      {/* Movie Hero Banner with Backdrop */}
      <div
        className="position-relative py-5 border-bottom border-secondary"
        style={{
          backgroundColor: '#12141c',
          backgroundImage: movie.bannerUrl ? `url(${movie.bannerUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for contrast */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to right, rgba(12,13,18,0.96) 30%, rgba(12,13,18,0.85) 100%)',
          }}
        ></div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center gy-4">
            {/* Movie Poster */}
            <div className="col-12 col-md-4 col-lg-3 text-center text-md-start">
              <div
                className="rounded-3 overflow-hidden shadow-lg mx-auto"
                style={{ maxWidth: '280px', border: '1px solid var(--border-light)' }}
              >
                <img
                  src={imgSrc}
                  alt={movie.title}
                  onError={() => setImgSrc(getMoviePosterPlaceholder(movie.title))}
                  className="w-100 object-fit-cover"
                  style={{ aspectRatio: '2/3' }}
                />
              </div>
            </div>

            {/* Movie Information */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger">{movie.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON'}</span>
                <span className="badge bg-dark border border-secondary text-secondary">{movie.certificate || 'UA'}</span>
                {movie.rating > 0 && (
                  <span className="badge bg-dark text-warning border border-secondary d-flex align-items-center gap-1">
                    <i className="bi bi-star-fill text-warning"></i> {movie.rating.toFixed(1)} / 10
                  </span>
                )}
                <span className="text-secondary small ms-2">
                  <i className="bi bi-clock me-1"></i> {formatDuration(movie.duration)}
                </span>
                <span className="text-secondary small ms-2">
                  <i className="bi bi-calendar3 me-1"></i> {formatDate(movie.releaseDate)}
                </span>
              </div>

              <h1 className="display-5 fw-extrabold text-white mb-2">{movie.title}</h1>

              <div className="d-flex flex-wrap gap-2 mb-3">
                {Array.isArray(movie.genre) &&
                  movie.genre.map((g) => (
                    <span key={g} className="badge bg-secondary text-white small">
                      {g}
                    </span>
                  ))}
                {Array.isArray(movie.language) &&
                  movie.language.map((l) => (
                    <span key={l} className="badge bg-dark border border-secondary text-secondary small">
                      {l}
                    </span>
                  ))}
              </div>

              <p className="text-secondary mb-4" style={{ maxWidth: '750px', lineHeight: '1.6' }}>
                {movie.description}
              </p>

              <div className="row g-3 small text-secondary">
                {movie.director && (
                  <div className="col-12 col-sm-6">
                    <strong className="text-white d-block mb-1">Director:</strong>
                    <span>{movie.director}</span>
                  </div>
                )}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="col-12 col-sm-6">
                    <strong className="text-white d-block mb-1">Cast:</strong>
                    <span>{movie.cast.join(', ')}</span>
                  </div>
                )}
              </div>

              {movie.trailerUrl && (
                <div className="mt-4">
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-imovies-outline d-inline-flex align-items-center gap-2"
                  >
                    <i className="bi bi-play-circle-fill text-danger fs-5"></i> Watch Official Trailer
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theatres Section */}
      <div className="container py-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h3 className="text-white fw-bold mb-1">Select Date & Showtimes</h3>
            <p className="text-secondary small mb-0">Choose your preferred theatre and show timing</p>
          </div>

          {/* Date Selector Tabs */}
          {uniqueDates.length > 0 && (
            <div className="d-flex gap-2 overflow-x-auto py-1">
              {uniqueDates.map((dateStr) => {
                const isSelected = dateStr === selectedDate;
                const d = new Date(dateStr);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();
                const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`btn text-center px-3 py-2 rounded-3 ${
                      isSelected ? 'btn-danger text-white' : 'btn-dark text-secondary border border-secondary'
                    }`}
                    style={{ minWidth: '85px' }}
                  >
                    <span className="d-block small text-uppercase" style={{ fontSize: '0.65rem' }}>
                      {dayName}
                    </span>
                    <span className="d-block fs-5 fw-bold">{dayNum}</span>
                    <span className="d-block small" style={{ fontSize: '0.65rem' }}>
                      {monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Shows Grouped by Theatre */}
        {shows.length === 0 ? (
          <div className="p-4 text-center rounded-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
            <h5 className="text-white">No shows currently scheduled</h5>
            <p className="text-secondary small mb-0">
              There are no active shows listed for this movie at this moment. Please check back later or check other movies.
            </p>
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="p-4 text-center rounded-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <p className="text-secondary mb-0">No shows available for the selected date. Please choose another date.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {Array.from(theatreMap.values()).map(({ theatre, shows: tShows }) => (
              <div
                key={theatre?._id || Math.random()}
                className="p-4 rounded-3"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
              >
                <div className="row align-items-center gy-3">
                  <div className="col-12 col-md-5">
                    <h5 className="text-white fw-bold mb-1">{theatre?.name || 'Multiplex Cinema'}</h5>
                    <p className="text-secondary small mb-2">
                      <i className="bi bi-geo-alt me-1 text-danger"></i>
                      {theatre?.location || theatre?.address || 'City Centre'}
                    </p>
                    {theatre?.amenities && (
                      <div className="d-flex flex-wrap gap-1">
                        {theatre.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="badge bg-dark border border-secondary text-secondary"
                            style={{ fontSize: '0.65rem' }}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-12 col-md-7">
                    <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                      {tShows.map((show) => (
                        <Link
                          key={show._id}
                          to={`/show/${show._id}/seats`}
                          className="btn btn-outline-danger px-3 py-2 text-center rounded-3 text-decoration-none"
                          style={{ minWidth: '110px' }}
                        >
                          <span className="d-block fw-bold fs-6 text-white">{show.startTime}</span>
                          <span className="d-block small text-secondary" style={{ fontSize: '0.7rem' }}>
                            {show.screenName || 'Screen 1'}
                          </span>
                          <span className="d-block text-danger fw-semibold small" style={{ fontSize: '0.72rem' }}>
                            from {formatCurrency(show.ticketPrice)}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
