import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

const POPULAR_CITIES = ['Delhi', 'Noida', 'Agra', 'Mumbai'];

const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80';

export function SearchPage() {
  const { list, loading, error, search } = useVehicles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters state from URL or defaults
  const initialCity = searchParams.get('city') || '';
  const [city, setCity] = useState(initialCity);
  const [vehicleType, setVehicleType] = useState(searchParams.get('vehicleType') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '');
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [seats, setSeats] = useState(searchParams.get('numberOfSeats') || '');

  // Keep state in sync with URL parameters
  useEffect(() => {
    const currentCity = searchParams.get('city') || '';
    setCity(currentCity);
    
    const params: Record<string, any> = {};
    if (currentCity) params.city = currentCity;
    if (vehicleType) params.vehicleType = vehicleType;
    if (fuelType) params.fuelType = fuelType;
    if (transmission) params.transmission = transmission;
    if (seats) params.numberOfSeats = seats;

    search(params);
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    executeSearch(city, vehicleType, fuelType, transmission, seats);
  };

  const executeSearch = (
    cityVal: string,
    vTypeVal: string,
    fTypeVal: string,
    transVal: string,
    seatsVal: string
  ) => {
    const newSearchParams = new URLSearchParams();
    if (cityVal) newSearchParams.set('city', cityVal);
    if (vTypeVal) newSearchParams.set('vehicleType', vTypeVal);
    if (fTypeVal) newSearchParams.set('fuelType', fTypeVal);
    if (transVal) newSearchParams.set('transmission', transVal);
    if (seatsVal) newSearchParams.set('numberOfSeats', seatsVal);

    setSearchParams(newSearchParams);
  };

  const handleCityChipClick = (selectedCity: string) => {
    const targetCity = city === selectedCity ? '' : selectedCity;
    setCity(targetCity);
    executeSearch(targetCity, vehicleType, fuelType, transmission, seats);
  };

  const handleResetFilters = () => {
    setCity('');
    setVehicleType('');
    setFuelType('');
    setTransmission('');
    setSeats('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="main-content">
      {/* Header & Quick City Chips */}
      <div style={{ marginBottom: '25px' }}>
        <h1>Find Your Next Wheel Swap</h1>
        <p>Browse clean, verified vehicles available for swap and rent in top cities.</p>

        {/* Quick Filter City Chips */}
        <div className="city-chips-container" style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Quick Select:</span>
          <button
            type="button"
            onClick={() => handleCityChipClick('')}
            className={`city-chip ${city === '' ? 'active' : ''}`}
          >
            All Cities
          </button>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleCityChipClick(c)}
              className={`city-chip ${city.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
            >
              📍 {c}
            </button>
          ))}
        </div>
      </div>

      <div className="search-container">
        {/* Left Side: Filter Form */}
        <form onSubmit={handleSearch} className="card filters-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Filters</h3>
            {(city || vehicleType || fuelType || transmission || seats) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Reset All
              </button>
            )}
          </div>

          <div className="filter-section">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                placeholder="Delhi, Noida, Agra..."
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
          {/* Results Header */}
          {!loading && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                {list.length} {list.length === 1 ? 'vehicle' : 'vehicles'} available {city ? `in "${city}"` : 'across all locations'}
              </span>
              <span className="badge badge-approved" style={{ fontSize: '11px' }}>KYC Verified Hosts Only</span>
            </div>
          )}

          {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader"></div></div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && list.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <h3>No Vehicles Found</h3>
              <p style={{ marginTop: '8px', marginBottom: '16px' }}>Try selecting a different city like Delhi, Noida, or Agra.</p>
              <button onClick={handleResetFilters} className="btn btn-secondary">
                Clear Filters
              </button>
            </div>
          )}

          {!loading && list.length > 0 && (
            <div className="grid-3">
              {list.map((vehicle) => {
                const primaryImage = vehicle.images?.find((img) => img.isPrimary) || vehicle.images?.[0];
                const displayImg = primaryImage?.url || DEFAULT_IMAGE_FALLBACK;

                return (
                  <div
                    key={vehicle.id}
                    className="vehicle-card"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <img
                      src={displayImg}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="vehicle-card-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE_FALLBACK;
                      }}
                    />

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
