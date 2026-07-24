import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useAuth } from '../../auth/hooks/useAuth';

const DEFAULT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentVehicle,
    loading,
    error,
    getById,
    uploadImages,
    removeImage,
    setPrimary,
    setBlockedDates,
    remove,
    resetCurrentVehicle,
  } = useVehicles();

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (id) {
      getById(id);
    }
    return () => {
      resetCurrentVehicle();
    };
  }, [id]);

  useEffect(() => {
    if (currentVehicle && currentVehicle.images?.length > 0) {
      const primary = currentVehicle.images.find((img) => img.isPrimary) || currentVehicle.images[0];
      setActiveImage(primary.url);
    } else {
      setActiveImage(DEFAULT_IMAGE_FALLBACK);
    }
  }, [currentVehicle]);

  const isOwner = currentVehicle && user && currentVehicle.ownerId === user.id;

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    if (!id || !imageFiles) return;

    try {
      await uploadImages(id, imageFiles);
      setSuccessMsg('Images uploaded successfully!');
      setImageFiles(null);
      const fileInput = document.getElementById('vehicle-images-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setLocalError(err.message || 'Image upload failed');
    }
  };

  const handleBlockDates = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');
    if (!id || !startDate || !endDate) return;

    try {
      await setBlockedDates(id, {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isBlocked: true,
        reason: blockedReason || 'Maintenance',
      });
      setSuccessMsg('Availability calendar updated!');
      setStartDate('');
      setEndDate('');
      setBlockedReason('');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update calendar');
    }
  };

  const handleDeleteListing = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await remove(id);
        navigate('/my-vehicles');
      } catch (err: any) {
        setLocalError(err.message || 'Failed to delete listing');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}><div className="loader"></div></div>;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!currentVehicle) return <div className="main-content"><h3>Vehicle not found</h3></div>;

  return (
    <div className="main-content">
      {(successMsg || localError) && (
        <div style={{ marginBottom: '20px' }}>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {localError && <div className="alert alert-danger">{localError}</div>}
        </div>
      )}

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>{currentVehicle.brand} {currentVehicle.model}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>📍 {currentVehicle.address || currentVehicle.city}, {currentVehicle.state}</p>
        </div>

        {isOwner && (
          <button onClick={handleDeleteListing} className="btn btn-danger">
            Delete Listing
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid-2" style={{ alignItems: 'start', gap: '30px' }}>

        {/* Left Column: Image Gallery & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Main Visual Display */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)' }}>
            <img
              src={activeImage || DEFAULT_IMAGE_FALLBACK}
              alt="Vehicle view"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_IMAGE_FALLBACK;
              }}
            />
          </div>

          {/* Thumbnails list */}
          {currentVehicle.images?.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {currentVehicle.images.map((img) => (
                <div key={img.id} style={{ position: 'relative', cursor: 'pointer' }}>
                  <img
                    src={img.url}
                    alt="Thumbnail"
                    onClick={() => setActiveImage(img.url)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_IMAGE_FALLBACK;
                    }}
                    style={{
                      width: '80px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      border: activeImage === img.url ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                    }}
                  />
                  {isOwner && (
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', gap: '2px' }}>
                      <button
                        onClick={() => removeImage(currentVehicle.id, img.id)}
                        style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete Image"
                      >
                        ×
                      </button>
                      {!img.isPrimary && (
                        <button
                          onClick={() => setPrimary(currentVehicle.id, img.id)}
                          style={{ background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Set as Primary"
                        >
                          ★
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Specifications Card */}
          <div className="card">
            <h3 style={{ marginBottom: '15px' }}>Specifications</h3>
            <div className="grid-2" style={{ gap: '10px', fontSize: '14px' }}>
              <div><strong>Year:</strong> {currentVehicle.year}</div>
              <div><strong>Vehicle Type:</strong> {currentVehicle.vehicleType}</div>
              <div><strong>Transmission:</strong> {currentVehicle.transmission}</div>
              <div><strong>Fuel Type:</strong> {currentVehicle.fuelType}</div>
              <div><strong>Seats:</strong> {currentVehicle.numberOfSeats} Seats</div>
              <div><strong>Color:</strong> {currentVehicle.color || 'Not specified'}</div>
              <div><strong>License Plate:</strong> {isOwner ? currentVehicle.licensePlate : 'Visible on approval'}</div>
              <div><strong>Registration:</strong> {isOwner ? currentVehicle.registrationNumber : 'Visible on approval'}</div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '8px' }}>Description</h4>
              <p style={{ fontSize: '14px' }}>{currentVehicle.description || 'No description provided.'}</p>
            </div>

            {currentVehicle.features?.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Features</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentVehicle.features.map((feature, index) => (
                    <span key={index} className="vehicle-card-badge">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Owner / Booking Management & Calendar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Owner Details Card */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentVehicle.owner?.avatarUrl ? (
              <img src={currentVehicle.owner.avatarUrl} alt={currentVehicle.owner.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
                {currentVehicle.owner?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Registered Owner</p>
              <h4>{currentVehicle.owner?.name}</h4>
              <span className={`badge ${currentVehicle.owner?.isKycVerified ? 'badge-approved' : 'badge-pending'}`} style={{ fontSize: '10px', marginTop: '4px' }}>
                {currentVehicle.owner?.isKycVerified ? 'KYC Verified' : 'KYC Pending'}
              </span>
            </div>
          </div>

          {/* Owner Dashboard Actions */}
          {isOwner ? (
            <>
              {/* Image Uploader */}
              {currentVehicle.images?.length < 10 && (
                <div className="card">
                  <h3 style={{ marginBottom: '15px' }}>Upload Vehicle Images</h3>
                  <form onSubmit={handleImageUpload}>
                    <input
                      type="file"
                      id="vehicle-images-input"
                      multiple
                      accept="image/*"
                      className="form-input"
                      onChange={(e) => setImageFiles(e.target.files)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                      Upload Images
                    </button>
                  </form>
                </div>
              )}

              {/* Block Calendar Dates */}
              <div className="card">
                <h3 style={{ marginBottom: '15px' }}>Block Calendar Dates</h3>
                <form onSubmit={handleBlockDates}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Maintenance, Personal Use"
                      value={blockedReason}
                      onChange={(e) => setBlockedReason(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Block Selected Dates
                  </button>
                </form>
              </div>
            </>
          ) : (
            // Swap Request CTA
            <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
              <h3>Interested in this Vehicle?</h3>
              <p style={{ marginTop: '10px', fontSize: '14px', marginBottom: '20px' }}>
                You can initiate a vehicle swap request or booking directly with verified host {currentVehicle.owner?.name}.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', opacity: 0.85 }}>
                Initiate Swap Request
              </button>
            </div>
          )}

          {/* Availability Calendar display */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>Blocked Dates & Availability</h3>
            {currentVehicle.availability?.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>This vehicle is fully available for swap.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentVehicle.availability?.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderLeft: '4px solid var(--error)',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>Blocked Dates:</strong>
                      <div>
                        {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reason: {block.reason || 'None'}</span>
                    </div>
                    <span className="badge badge-rejected" style={{ fontSize: '10px' }}>Blocked</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
