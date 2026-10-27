import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon = 'bi-film',
  title = 'No items found',
  message = 'There are no records matching your current filter criteria.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div className="text-center py-5 my-4 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
        style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <i className={`bi ${icon} fs-2 text-danger`}></i>
      </div>
      <h5 className="text-white fw-bold mb-2">{title}</h5>
      <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '420px' }}>
        {message}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-imovies-primary">
          {actionText}
        </Link>
      )}
      {actionText && onAction && (
        <button className="btn btn-imovies-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
