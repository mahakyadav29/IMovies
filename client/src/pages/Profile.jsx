import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, phone });
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container py-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div
            className="imovies-card p-4 p-md-5"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* Profile Avatar and Name */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom border-secondary">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3"
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: user.role === 'admin' ? '#f59e0b' : 'var(--accent-red)',
                }}
              >
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-white fw-bold mb-1">{user.name}</h4>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-secondary small">{user.email}</span>
                  <span
                    className={`badge ${user.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary text-white'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {user.role === 'admin' ? 'ADMINISTRATOR' : 'CUSTOMER'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Edit Form */}
            <form onSubmit={handleUpdate}>
              <div className="mb-3">
                <label className="form-label small text-secondary">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  value={user.email}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                  Email address cannot be changed.
                </span>
              </div>

              <div className="mb-4">
                <label className="form-label small text-secondary">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                <span className="text-secondary small">
                  Member since {formatDate(user.createdAt || new Date())}
                </span>
                <button type="submit" disabled={loading} className="btn btn-imovies-primary px-4">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
