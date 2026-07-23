import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

export function AddVehiclePage() {
  const { create, error, resetError, loading } = useVehicles();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vehicleType: 'SEDAN',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    numberOfSeats: 5,
    color: '',
    licensePlate: '',
    registrationNumber: '',
    description: '',
    city: '',
    state: '',
    address: '',
    featuresInput: '',
    isAvailableForRent: true,
    isAvailableForSwap: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'year' || name === 'numberOfSeats' ? parseInt(value) || 0 : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();

    // Parse features comma separated list
    const features = formData.featuresInput
      ? formData.featuresInput.split(',').map((f) => f.trim()).filter((f) => f.length > 0)
      : [];

    const payload = {
      ...formData,
      features,
    };

    // Delete featuresInput temporary form state field
    delete (payload as any).featuresInput;

    try {
      const vehicle = await create(payload);
      navigate(`/vehicles/${vehicle.id}`);
    } catch {
      // Handled by Redux
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '10px' }}>Register Your Vehicle</h2>
        <p style={{ marginBottom: '24px' }}>Provide accurate details about your vehicle to list it for rent or swap on the platform.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Brand / Make</label>
              <input type="text" name="brand" className="form-input" placeholder="e.g. Honda, Maruti Suzuki" value={formData.brand} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input type="text" name="model" className="form-input" placeholder="e.g. Civic, Swift" value={formData.model} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Year of Manufacture</label>
              <input type="number" name="year" className="form-input" min={1990} max={new Date().getFullYear() + 1} value={formData.year} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Seats</label>
              <input type="number" name="numberOfSeats" className="form-input" min={1} max={10} value={formData.numberOfSeats} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select name="vehicleType" className="form-input" value={formData.vehicleType} onChange={handleChange}>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="TWO_WHEELER">Two Wheeler</option>
                <option value="TRUCK">Truck</option>
                <option value="VAN">Van</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select name="fuelType" className="form-input" value={formData.fuelType} onChange={handleChange}>
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select name="transmission" className="form-input" value={formData.transmission} onChange={handleChange}>
                <option value="MANUAL">Manual</option>
                <option value="AUTOMATIC">Automatic</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input type="text" name="color" className="form-input" placeholder="e.g. Red, Black, White" value={formData.color} onChange={handleChange} />
            </div>
          </div>

          <h4 style={{ margin: '24px 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Registration & Identification</h4>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">License Plate Number (Indian Format)</label>
              <input type="text" name="licensePlate" className="form-input" placeholder="MH12AB1234" value={formData.licensePlate} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">RC/Registration Number</label>
              <input type="text" name="registrationNumber" className="form-input" placeholder="RC-MH12-98765" value={formData.registrationNumber} onChange={handleChange} required />
            </div>
          </div>

          <h4 style={{ margin: '24px 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Location Details</h4>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-input" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-input" placeholder="e.g. Maharashtra" value={formData.state} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Pickup Address</label>
            <input type="text" name="address" className="form-input" placeholder="Complete address detail..." value={formData.address} onChange={handleChange} />
          </div>

          <h4 style={{ margin: '24px 0 10px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Description & Additional Specs</h4>

          <div className="form-group">
            <label className="form-label">Features (Comma separated list)</label>
            <input type="text" name="featuresInput" className="form-input" placeholder="e.g. GPS, Sunroof, Backup Camera, Bluetooth" value={formData.featuresInput} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Guidelines</label>
            <textarea name="description" className="form-input" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Add vehicle highlights, rules, and pickup notes..." value={formData.description} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              <input type="checkbox" name="isAvailableForRent" checked={formData.isAvailableForRent} onChange={handleChange} />
              Available for Rent
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              <input type="checkbox" name="isAvailableForSwap" checked={formData.isAvailableForSwap} onChange={handleChange} />
              Available for Swap
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Submitting Registration...' : 'Register Vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}
