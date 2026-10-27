import React from 'react';

const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div
      className="alert alert-danger d-flex align-items-center justify-content-between p-3 my-4"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#fca5a5',
        borderRadius: '10px',
      }}
      role="alert"
    >
      <div className="d-flex align-items-center">
        <i className="bi bi-exclamation-triangle-fill fs-4 me-3 text-danger"></i>
        <div>
          <strong className="d-block text-white">Something went wrong</strong>
          <span className="small">{message || 'An unexpected error occurred while communicating with the server.'}</span>
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger ms-3 px-3" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-1"></i> Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
