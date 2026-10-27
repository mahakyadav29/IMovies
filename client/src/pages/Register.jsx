import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({ name, email, phone, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: '480px' }}>
        <div
          className="imovies-card p-4 p-md-5 shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <span className="brand-badge mb-2 d-inline-block">IM</span>
            <h3 className="text-white fw-bold mb-1">Create Account</h3>
            <p className="text-secondary small mb-0">Join IMovies to book cinema tickets instantly</p>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-secondary">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="form-control"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-secondary">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                className="form-control"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-secondary">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="row g-2 mb-4">
              <div className="col-12 col-sm-6">
                <label className="form-label small text-secondary">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label small text-secondary">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="form-control"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-imovies-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              Register Account
            </button>
          </form>

          <div className="text-center pt-3 border-top border-secondary">
            <span className="text-secondary small">Already have an account? </span>
            <Link to="/login" className="text-danger small text-decoration-none fw-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
