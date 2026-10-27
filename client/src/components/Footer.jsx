import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="mt-auto py-4 border-top"
      style={{
        backgroundColor: '#090a0d',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="container">
        <div className="row gy-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="brand-badge" style={{ fontSize: '0.85rem' }}>
                IM
              </span>
              <span className="fw-bold text-white fs-5">IMovies</span>
            </div>
            <p className="text-secondary small mb-0">
              Movie Ticket Booking Made Simple. A complete full-stack MERN academic project demonstrating real-time seat
              concurrency, simulated payments, and role-based management.
            </p>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="text-white small fw-bold text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
              Quick Navigation
            </h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-1">
                <Link to="/" className="text-secondary text-decoration-none hover-white">
                  Browse Movies
                </Link>
              </li>
              <li className="mb-1">
                <Link to="/theatres" className="text-secondary text-decoration-none hover-white">
                  Find Theatres
                </Link>
              </li>
              <li className="mb-1">
                <Link to="/bookings" className="text-secondary text-decoration-none hover-white">
                  Booking History
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-4 text-md-end">
            <span
              className="badge bg-dark border border-secondary text-secondary mb-2"
              style={{ fontSize: '0.72rem' }}
            >
              MERN Stack • Socket.IO • Bootstrap
            </span>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.75rem' }}>
              Designed for College Project Demonstration • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
