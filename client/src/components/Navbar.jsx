import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Poll notifications every 45s
      const timer = setInterval(loadNotifications, 45000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Graceful silence for polling errors
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignored
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-imovies py-2">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" to="/">
          <span className="brand-badge">IM</span>
          <span className="text-white" style={{ letterSpacing: '0.5px' }}>
            IMovies
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-white fw-bold' : ''}`} to="/">
                <i className="bi bi-film me-1"></i> Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'text-white fw-bold' : ''}`} to="/theatres">
                <i className="bi bi-geo-alt me-1"></i> Theatres
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? 'text-white fw-bold' : ''}`}
                  to="/bookings"
                >
                  <i className="bi bi-ticket-detailed me-1"></i> My Bookings
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link text-warning fw-semibold ${isActive ? 'fw-bold text-decoration-underline' : ''}`
                  }
                  to="/admin"
                >
                  <i className="bi bi-shield-lock-fill me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action Menu */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Dropdown */}
                <div className="position-relative">
                  <button
                    className="btn btn-sm btn-imovies-outline position-relative px-2 py-1"
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    title="Notifications"
                  >
                    <i className="bi bi-bell fs-6"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div
                      className="position-absolute end-0 mt-2 p-2 shadow-lg"
                      style={{
                        width: '320px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        zIndex: 1050,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center p-2 border-bottom border-secondary mb-2">
                        <span className="fw-bold small text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-link p-0 text-danger small text-decoration-none"
                            style={{ fontSize: '0.72rem' }}
                            onClick={handleMarkAllRead}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <p className="text-secondary small text-center my-3">No notifications</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-2 mb-1 rounded small ${n.read ? 'text-secondary' : 'text-white'}`}
                              style={{
                                backgroundColor: n.read ? 'transparent' : 'var(--bg-surface)',
                                borderLeft: n.read ? 'none' : '3px solid var(--accent-red)',
                              }}
                            >
                              <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>
                                {n.title}
                              </div>
                              <div style={{ fontSize: '0.72rem' }}>{n.message}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown / Profile */}
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/profile"
                    className="d-flex align-items-center gap-2 text-decoration-none text-white px-2 py-1 rounded"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: isAdmin ? '#f59e0b' : 'var(--accent-red)',
                        fontSize: '0.75rem',
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="small fw-medium d-none d-sm-inline">{user.name.split(' ')[0]}</span>
                    {isAdmin && (
                      <span className="badge bg-warning text-dark small" style={{ fontSize: '0.6rem' }}>
                        Admin
                      </span>
                    )}
                  </Link>

                  <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout} title="Log out">
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-imovies-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-imovies-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
