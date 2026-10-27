import React, { useState, useEffect } from 'react';
import { theatreService } from '../services/theatreService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';

const Theatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTheatres();
  }, [selectedLocation]);

  const fetchTheatres = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedLocation !== 'all' ? { location: selectedLocation } : {};
      const res = await theatreService.getTheatres(params);
      setTheatres(res.theatres || []);
      if (res.locations) setLocations(res.locations);
    } catch (err) {
      setError(err.message || 'Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Locating cinema theatres..." />;
  if (error) return <div className="container py-4"><ErrorAlert message={error} onRetry={fetchTheatres} /></div>;

  return (
    <div className="container py-4 flex-grow-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary gap-3">
        <div>
          <h2 className="text-white fw-bold mb-1">Partner Cinema Theatres</h2>
          <p className="text-secondary small mb-0">Browse top multiplexes equipped with IMAX, 4K Laser & Dolby Atmos</p>
        </div>

        {/* Location Filter */}
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary small d-none d-sm-inline">Location:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {theatres.length === 0 ? (
        <EmptyState
          icon="bi-geo-alt"
          title="No theatres found"
          message="No partner theatres found in this location."
          actionText="Show All Theatres"
          onAction={() => setSelectedLocation('all')}
        />
      ) : (
        <div className="row g-4">
          {theatres.map((theatre) => (
            <div key={theatre._id} className="col-12 col-md-6">
              <div className="imovies-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="text-white fw-bold mb-0">{theatre.name}</h5>
                    <span className="badge bg-danger small" style={{ fontSize: '0.7rem' }}>
                      {theatre.totalScreens || 1} Screens
                    </span>
                  </div>

                  <p className="text-secondary small mb-3">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                    {theatre.address}
                  </p>

                  <h6 className="text-white small fw-bold mb-2">Multiplex Amenities:</h6>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {theatre.amenities?.map((amenity) => (
                      <span
                        key={amenity}
                        className="badge bg-dark border border-secondary text-secondary"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <i className="bi bi-check-circle text-danger me-1"></i>
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary text-end">
                  <span className="text-secondary small">
                    <i className="bi bi-ticket-perforated text-danger me-1"></i>
                    Online Booking Enabled
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Theatres;
