import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

export function MyVehiclesPage() {
  const { myVehicles, loading, error, getMyVehicles } = useVehicles();
  const navigate = useNavigate();

  useEffect(() => {
    getMyVehicles();
  }, []);

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>My Registered Vehicles</h1>
          <p>Manage your listed vehicles, upload images, and control availability calendars.</p>
        </div>
        <Link to="/my-vehicles/add" className="btn btn-primary">
          + Add New Vehicle
        </Link>
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader"></div></div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && myVehicles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <h3>No Vehicles Listed Yet</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>List your vehicle to start swapping or renting to verified community members.</p>
          <Link to="/my-vehicles/add" className="btn btn-primary">
            List Your Vehicle Now
          </Link>
        </div>
      )}

      {!loading && myVehicles.length > 0 && (
        <div className="grid-3">
          {myVehicles.map((vehicle) => {
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
                  <div className="vehicle-card-img-placeholder">No Image Uploaded</div>
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
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Status:</span>
                  <span
                    className={`badge badge-${
                      vehicle.status === 'ACTIVE'
                        ? 'approved'
                        : vehicle.status === 'PENDING_APPROVAL'
                        ? 'pending'
                        : 'rejected'
                    }`}
                    style={{ fontSize: '11px' }}
                  >
                    {vehicle.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
