import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showService } from '../../services/showService';
import { movieService } from '../../services/movieService';
import { theatreService } from '../../services/theatreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    movie: '',
    theatre: '',
    screenName: 'Screen 1 (Dolby Atmos)',
    showDate: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    ticketPrice: 200,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        showService.getShows(),
        movieService.getMovies({ limit: 100 }),
        theatreService.getTheatres(),
      ]);

      setShows(showsRes.shows || []);
      setMovies(moviesRes.movies || []);
      setTheatres(theatresRes.theatres || []);

      if (moviesRes.movies?.length > 0 && theatresRes.theatres?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          movie: moviesRes.movies[0]._id,
          theatre: theatresRes.theatres[0]._id,
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load show data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData((prev) => ({
      ...initialForm,
      movie: movies[0]?._id || '',
      theatre: theatres[0]?._id || '',
    }));
    setIsModalOpen(true);
  };

  const handleDelete = async (show) => {
    if (!window.confirm(`Are you sure you want to delete this show for "${show.movie?.title}"?`)) return;
    try {
      await showService.deleteShow(show._id);
      toast.success('Show deleted successfully.');
      setShows((prev) => prev.filter((s) => s._id !== show._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete show.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await showService.createShow({
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
      });

      toast.success('Show created successfully with 60 generated seats!');
      setShows((prev) => [res.show, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create show.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading shows and cinema schedules..." />;

  return (
    <div className="container py-4 flex-grow-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none">
            <i className="bi bi-chevron-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0 mt-1">Show Scheduling & Seat Management</h2>
        </div>
        <button className="btn btn-sm btn-imovies-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-1"></i> Schedule New Show
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchInitialData} />}

      <div className="imovies-card p-3 p-md-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small text-uppercase" style={{ fontSize: '0.75rem' }}>
                <th>Movie</th>
                <th>Theatre & Screen</th>
                <th>Date</th>
                <th>Time</th>
                <th>Base Price</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => (
                <tr key={s._id} style={{ borderColor: 'var(--border-color)' }}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={s.movie?.posterUrl}
                        alt={s.movie?.title}
                        className="rounded object-fit-cover"
                        style={{ width: '32px', height: '46px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="text-white fw-bold small">{s.movie?.title}</span>
                    </div>
                  </td>
                  <td>
                    <div className="text-white small fw-medium">{s.theatre?.name}</div>
                    <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                      {s.screenName}
                    </div>
                  </td>
                  <td className="text-secondary small">{formatDate(s.showDate)}</td>
                  <td>
                    <span className="badge bg-danger small">{s.startTime}</span>
                  </td>
                  <td className="text-white small fw-semibold">{formatCurrency(s.ticketPrice)}</td>
                  <td>
                    <span className={`badge ${s.isActive ? 'badge-confirmed' : 'badge-cancelled'} small`}>
                      {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      to={`/show/${s._id}/seats`}
                      className="btn btn-sm btn-outline-info me-2"
                      title="View Seat Map"
                    >
                      <i className="bi bi-grid-3x3-gap"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(s)}
                      title="Delete Show"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Show Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Schedule New Movie Show</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Movie *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.movie}
                      onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
                    >
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.certificate || 'UA'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Select Multiplex Theatre *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.theatre}
                      onChange={(e) => setFormData({ ...formData, theatre: e.target.value })}
                    >
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} - {t.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Screen Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.screenName}
                      onChange={(e) => setFormData({ ...formData, screenName: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Show Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={formData.showDate}
                        onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-secondary">Start Time *</label>
                      <select
                        className="form-select"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      >
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="01:30 PM">01:30 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="08:30 PM">08:30 PM</option>
                        <option value="11:15 PM">11:15 PM (Late Night)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Base Ticket Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="50"
                      className="form-control"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    />
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      Generates 60 seats (Silver: 1x, Gold: 1.25x, Platinum: 1.5x)
                    </span>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-imovies-primary" disabled={formLoading}>
                    {formLoading ? 'Creating...' : 'Create Show & Generate Seats'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShows;
