import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { theatreService } from '../../services/theatreService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { toast } from 'react-toastify';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    name: '',
    location: '',
    address: '',
    totalScreens: 4,
    amenities: 'Dolby Atmos, 4K Laser Projection, Parking, Cafeteria',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await theatreService.getTheatres();
      setTheatres(res.theatres || []);
    } catch (err) {
      setError(err.message || 'Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (theatre) => {
    setEditingTheatre(theatre);
    setFormData({
      name: theatre.name || '',
      location: theatre.location || '',
      address: theatre.address || '',
      totalScreens: theatre.totalScreens || 1,
      amenities: Array.isArray(theatre.amenities)
        ? theatre.amenities.join(', ')
        : theatre.amenities || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (theatre) => {
    if (!window.confirm(`Are you sure you want to delete theatre "${theatre.name}"?`)) return;
    try {
      await theatreService.deleteTheatre(theatre._id);
      toast.success('Theatre deleted successfully.');
      setTheatres((prev) => prev.filter((t) => t._id !== theatre._id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete theatre.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = {
      ...formData,
      totalScreens: Number(formData.totalScreens),
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      if (editingTheatre) {
        const res = await theatreService.updateTheatre(editingTheatre._id, payload);
        toast.success('Theatre updated successfully.');
        setTheatres((prev) => prev.map((t) => (t._id === editingTheatre._id ? res.theatre : t)));
      } else {
        const res = await theatreService.createTheatre(payload);
        toast.success('New theatre created successfully!');
        setTheatres((prev) => [res.theatre, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save theatre.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading theatres..." />;

  return (
    <div className="container py-4 flex-grow-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none">
            <i className="bi bi-chevron-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0 mt-1">Multiplex Theatre Management</h2>
        </div>
        <button className="btn btn-sm btn-imovies-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-1"></i> Add New Theatre
        </button>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchTheatres} />}

      <div className="imovies-card p-3 p-md-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small text-uppercase" style={{ fontSize: '0.75rem' }}>
                <th>Theatre Name</th>
                <th>Location</th>
                <th>Address</th>
                <th>Screens</th>
                <th>Amenities</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {theatres.map((t) => (
                <tr key={t._id} style={{ borderColor: 'var(--border-color)' }}>
                  <td className="text-white fw-bold small">{t.name}</td>
                  <td className="text-danger small">{t.location}</td>
                  <td className="text-secondary small">{t.address}</td>
                  <td className="text-white small">{t.totalScreens}</td>
                  <td className="small text-secondary">
                    {Array.isArray(t.amenities) ? t.amenities.slice(0, 3).join(', ') : t.amenities}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleOpenEdit(t)}
                      title="Edit Theatre"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(t)}
                      title="Delete Theatre"
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

      {/* Add / Edit Theatre Modal */}
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
                <h5 className="modal-title fw-bold">{editingTheatre ? 'Edit Theatre' : 'Add New Theatre'}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Theatre Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. PVR: Phoenix Mall"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Location / Area *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Lower Parel, Mumbai"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Full Address *</label>
                    <textarea
                      required
                      rows="2"
                      className="form-control"
                      placeholder="Street address, City, Pin"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-secondary">Total Screens</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.totalScreens}
                        onChange={(e) => setFormData({ ...formData, totalScreens: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-secondary">Amenities (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Dolby Atmos, 4K Laser, Parking"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    />
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
                    {formLoading ? 'Saving...' : editingTheatre ? 'Update Theatre' : 'Create Theatre'}
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

export default AdminTheatres;
