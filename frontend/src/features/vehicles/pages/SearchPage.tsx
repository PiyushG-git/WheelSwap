import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

export function SearchPage() {
  const { list, loading, error, search } = useVehicles();
  const navigate = useNavigate();

  // Search parameters state
  const [city, setCity] = useState('Mumbai');
  const [vehicleType, setVehicleType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [seats, setSeats] = useState('');

  useEffect(() => {
    // Initial search
    search({ city });
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params: Record<string, any> = {};
    if (city) params.city = city;
    if (vehicleType) params.vehicleType = vehicleType;
    if (fuelType) params.fuelType = fuelType;
    if (transmission) params.transmission = transmission;
    if (seats) params.numberOfSeats = seats;

    search(params);
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '30px' }}>
        <h1>Find Your Next Wheel Swap</h1>
        <p>Browse clean, verified vehicles available for swap and rent in your location.</p>
      </div>

      <div className="search-container">
        {/* Left Side: Filter Form */}
        <form onSubmit={handleSearch} className="card filters-card">
          <h3 style={{ marginBottom: '15px' }}>Filters</h3>

          <div className="filter-section">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="Mumbai, Pune, Delhi..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <label className="form-label">Vehicle Type</label>
            <select
              className="form-input"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              style={{ marginTop: '5px' }}
            >
              <option value="">All Types</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="TWO_WHEELER">Two Wheeler</option>
              <option value="TRUCK">Truck</option>
            </select>
          </div>

          <div className="filter-section">
            <label className="form-label">Fuel Type</label>
            <select
              className="form-input"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              style={{ marginTop: '5px' }}
            >
              <option value="">All Fuels</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Electric</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <div className="filter-section">
            <label className="form-label">Transmission</label>
            <select
              className="form-input"
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              style={{ marginTop: '5px' }}
            >
              <option value="">All Transmissions</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>

          <div className="filter-section">
            <label className="form-label">Min Seats</label>
            <select
              className="form-input"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              style={{ marginTop: '5px' }}
            >
              <option value="">Any Seats</option>
              <option value="2">2+ Seats</option>
              <option value="4">4+ Seats</option>
              <option value="5">5+ Seats</option>
              <option value="7">7+ Seats</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Apply Search
          </button>
        </form>

        {/* Right Side: Search Results */}
        <div className="search-results-section">
          {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && list.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <h3>No Vehicles Found</h3>
              <p style={{ marginTop: '8px' }}>Try searching in a different city or removing filter settings.</p>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div className="grid-3">
              {list.map((vehicle) => {
                const primaryImage = vehicle.images?.find((img) => img.isPrimary) || vehicle.images?.[0];
                
                return (
                  <div
                    key={vehicle.id}
                    className="vehicle-card"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    {primaryImage ? (
                      <img src={primaryImage.url} alt={`${vehicle.brand} ${vehicle.model}`} className="vehicle-card-img" />
                    ) : (
                      <div className="vehicle-card-img-placeholder">No Image Available</div>
                    )}
                    
                    <div className="vehicle-card-content">
                      <div className="vehicle-card-header">
                        <span className="vehicle-card-title">{vehicle.brand} {vehicle.model}</span>
                        <span className="vehicle-card-badge">{vehicle.year}</span>
                      </div>
                      
                      <div className="vehicle-card-location">
                        📍 {vehicle.city}, {vehicle.state}
                      </div>

                      <div className="vehicle-card-details">
                        <span className="vehicle-card-badge">{vehicle.vehicleType}</span>
                        <span className="vehicle-card-badge">{vehicle.transmission}</span>
                        <span className="vehicle-card-badge">{vehicle.fuelType}</span>
                      </div>
                    </div>

                    <div className="vehicle-card-footer">
                      <div className="vehicle-card-owner">
                        {vehicle.owner?.avatarUrl ? (
                          <img src={vehicle.owner.avatarUrl} alt={vehicle.owner.name} className="owner-avatar" />
                        ) : (
                          <div className="owner-avatar-placeholder">
                            {vehicle.owner?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                        <span>{vehicle.owner?.name}</span>
                      </div>
                      <span className="badge badge-approved" style={{ fontSize: '11px' }}>Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
