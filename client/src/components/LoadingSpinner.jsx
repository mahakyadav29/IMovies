import React from 'react';

const LoadingSpinner = ({ message = 'Loading cinema experience...' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
      <div
        className="spinner-border text-danger"
        style={{ width: '3rem', height: '3rem', borderWidth: '0.25rem' }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-secondary small fw-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
