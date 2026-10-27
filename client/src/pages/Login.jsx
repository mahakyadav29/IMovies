import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorAlert from '../components/ErrorAlert';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.user?.role === 'admin' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill demo accounts
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div
          className="imovies-card p-4 p-md-5 shadow-lg"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          {/* Header */}
          <div className="text-center mb-4">
            <span className="brand-badge mb-2 d-inline-block">IM</span>
            <h3 className="text-white fw-bold mb-1">Sign In to IMovies</h3>
            <p className="text-secondary small mb-0">Enter your credentials to access your account</p>
          </div>

          {/* Quick Demo Login Credentials Bar */}
          <div className="p-3 mb-4 rounded-3 text-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <span className="text-secondary small d-block mb-2 fw-semibold" style={{ fontSize: '0.72rem' }}>
              COLLEGE DEMO QUICK-FILL
            </span>
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-sm btn-outline-warning small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillCredentials('admin@imovies.com', 'Admin@123456')}
              >
                <i className="bi bi-shield-lock me-1"></i> Admin Login
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-info small"
                style={{ fontSize: '0.75rem' }}
                onClick={() => fillCredentials('user@imovies.com', 'User@123456')}
              >
                <i className="bi bi-person me-1"></i> Customer Login
              </button>
            </div>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small text-secondary mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  required
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-imovies-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
            >
              {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
              Sign In
            </button>
          </form>

          <div className="text-center pt-3 border-top border-secondary">
            <span className="text-secondary small">Don't have an account? </span>
            <Link to="/register" className="text-danger small text-decoration-none fw-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
