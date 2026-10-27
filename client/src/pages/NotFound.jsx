import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container py-5 text-center flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div className="display-1 fw-extrabold text-danger mb-2 font-monospace">404</div>
      <h3 className="text-white fw-bold mb-2">Page Not Found</h3>
      <p className="text-secondary small mb-4" style={{ maxWidth: '400px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-imovies-primary">
        <i className="bi bi-house-door-fill me-2"></i> Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
