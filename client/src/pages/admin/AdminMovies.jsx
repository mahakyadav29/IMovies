import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { formatDuration } from '../../utils/formatters';
import { toast } from 'react-toastify';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    title: '',
    description: '',
    genre: '',
    language: '',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    bannerUrl: '',
    trailerUrl: '',
    rating: 8.0,
    cast: '',
    director: '',
    status: 'now_showing',
    certificate: 'UA',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getMovies({ limit: 100, status: 'all' });
      setMovies(res.movies || []);
    } catch (err) {
      setError(err.message || 'Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
      language: Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || '',
      duration: movie.duration || 120,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      posterUrl: movie.posterUrl || '',
      bannerUrl: movie.bannerUrl || '',
      trailerUrl: movie.trailerUrl || '',
      rating: movie.rating || 0,
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || '',
      director: movie.director || '',
      status: movie.status || 'now_showing',
      certificate: movie.certificate || 'UA',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (movie) => {
    if (!window.confirm(`Are you sure you want to delete movie "${movie.title}"?`)) return;
    try {
      await movieService.deleteMovie(movie._id);
      toast.success('Movie deleted successfully.');
      setMovies((prev) => prev.filter((m) => m._id !== movie._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete movie.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      ...formData,
      duration: Number(formData.duration),
      rating: Number(formData.rating),
      genre: formData.genre.split(',').map((g) => g.trim()).filter(Boolean),
      language: formData.language.split(',').map((l) => l.trim()).filter(Boolean),
      cast: formData.cast.split(',').map((c) => c.trim()).filter(Boolean),
    };

    try {
      if (editingMovie) {
        const res = await movieService.updateMovie(editingMovie._id, payload);
        toast.success('Movie updated successfully.');
        setMovies((prev) => prev.map((m) => (m._id === editingMovie._id ? res.movie : m)));
      } else {
        const res = await movieService.createMovie(payload);
        toast.success('New movie created successfully!');
        setMovies((prev) => [res.movie, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save movie.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading movies..." />;

  return (
    <div className="container py-4 flex-grow-1">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none">
            <i className="bi bi-chevron-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0 mt-1">Movie Catalog Management</h2>
        </div>
        <button className="btn btn-sm btn-imovies-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-1"></i> Add New Movie
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchMovies} />}

      {/* Movies Table */}
      <div className="imovies-card p-3 p-md-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small text-uppercase" style={{ fontSize: '0.75rem' }}>
                <th>Movie</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id} style={{ borderColor: 'var(--border-color)' }}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        className="rounded object-fit-cover"
                        style={{ width: '40px', height: '56px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="text-white fw-bold small">{m.title}</div>
                        <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>
                          Cert: {m.certificate || 'UA'} • Dir: {m.director || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="small text-secondary">
                    {Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : m.genre}
                  </td>
                  <td className="small text-secondary">
                    {Array.isArray(m.language) ? m.language.slice(0, 2).join(', ') : m.language}
                  </td>
                  <td className="small text-secondary">{formatDuration(m.duration)}</td>
                  <td>
                    <span className="badge bg-dark border border-secondary text-warning small">
                      <i className="bi bi-star-fill text-warning me-1"></i>
                      {m.rating ? m.rating.toFixed(1) : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${m.status === 'now_showing' ? 'bg-danger' : 'bg-secondary'} small`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {m.status === 'now_showing' ? 'NOW SHOWING' : 'COMING SOON'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleOpenEdit(m)}
                      title="Edit Movie"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(m)}
                      title="Delete Movie"
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

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content text-white"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="form-label small text-secondary">Movie Title *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary">Certificate</label>
                      <select
                        className="form-select"
                        value={formData.certificate}
                        onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                      >
                        <option value="U">U (Universal)</option>
                        <option value="UA">UA (Parental Guidance)</option>
                        <option value="A">A (Adults 18+)</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small text-secondary">Description *</label>
                      <textarea
                        required
                        rows="3"
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Genre(s) (comma separated) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Action, Sci-Fi, Thriller"
                        className="form-control"
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Language(s) (comma separated) *</label>
                      <input
                        type="text"
                        required
                        placeholder="English, Hindi, Telugu"
                        className="form-control"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary">Duration (Minutes) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className="form-control"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary">Rating (0 to 10)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label small text-secondary">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Poster URL *</label>
                      <input
                        type="url"
                        required
                        className="form-control"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.posterUrl}
                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Banner URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.bannerUrl}
                        onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Director</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.director}
                        onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Cast (comma separated)</label>
                      <input
                        type="text"
                        placeholder="Actor 1, Actor 2"
                        className="form-control"
                        value={formData.cast}
                        onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                      />
                    </div>
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
                    {formLoading ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
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

export default AdminMovies;
