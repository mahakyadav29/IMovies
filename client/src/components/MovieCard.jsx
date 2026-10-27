import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getMoviePosterPlaceholder } from '../utils/placeholder';
import { formatDuration } from '../utils/formatters';

const MovieCard = ({ movie }) => {
  const [imgSrc, setImgSrc] = useState(movie.posterUrl);

  const handleImageError = () => {
    setImgSrc(getMoviePosterPlaceholder(movie.title));
  };

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="imovies-card h-100 d-flex flex-direction-column d-flex flex-column">
        {/* Poster Container */}
        <div className="position-relative overflow-hidden" style={{ paddingTop: '145%' }}>
          <img
            src={imgSrc}
            alt={movie.title}
            onError={handleImageError}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            loading="lazy"
          />

          {/* Status Badge */}
          <span
            className={`position-absolute top-2 start-2 badge m-2 ${
              movie.status === 'now_showing' ? 'bg-danger' : 'bg-secondary'
            }`}
            style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
          </span>

          {/* Rating Badge */}
          {movie.rating > 0 && (
            <span
              className="position-absolute top-2 end-2 badge bg-dark text-warning m-2 d-flex align-items-center gap-1 border border-secondary"
              style={{ fontSize: '0.75rem', backdropFilter: 'blur(4px)' }}
            >
              <i className="bi bi-star-fill text-warning"></i>
              {movie.rating.toFixed(1)}
            </span>
          )}

          {/* Overlay on hover for quick book */}
          <div
            className="position-absolute bottom-0 start-0 end-0 p-3 d-flex flex-column justify-content-end"
            style={{
              background: 'linear-gradient(to top, rgba(12,13,18,0.95) 0%, rgba(12,13,18,0.4) 60%, transparent 100%)',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-dark border border-secondary text-light small" style={{ fontSize: '0.65rem' }}>
                {movie.certificate || 'UA'}
              </span>
              <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
                {formatDuration(movie.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Details Container */}
        <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
          <div>
            <h6 className="text-white fw-bold mb-1 text-truncate" title={movie.title}>
              {movie.title}
            </h6>
            <p className="text-secondary small mb-2 text-truncate" style={{ fontSize: '0.75rem' }}>
              {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
            </p>
            <div className="d-flex flex-wrap gap-1 mb-3">
              {Array.isArray(movie.language) ? (
                movie.language.slice(0, 2).map((lang) => (
                  <span
                    key={lang}
                    className="badge bg-dark text-secondary border border-secondary"
                    style={{ fontSize: '0.65rem' }}
                  >
                    {lang}
                  </span>
                ))
              ) : (
                <span className="badge bg-dark text-secondary border border-secondary" style={{ fontSize: '0.65rem' }}>
                  {movie.language}
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/movie/${movie._id}`}
            className="btn btn-sm btn-imovies-primary w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="bi bi-ticket-perforated"></i>
            {movie.status === 'now_showing' ? 'Book Tickets' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
