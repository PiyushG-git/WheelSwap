import { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';

export function AdminDashboardPage() {
  const {
    pendingKyc,
    pendingVehicles,
    loading,
    error,
    getPendingKyc,
    getPendingVehicles,
    verifyKyc,
    verifyVehicle,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'kyc' | 'vehicles'>('kyc');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'kyc') {
      getPendingKyc();
    } else {
      getPendingVehicles();
    }
  }, [activeTab]);

  const handleVerifyKyc = async (userId: string, approve: boolean) => {
    setSuccessMessage('');
    if (!approve) {
      setRejectId(userId);
      return;
    }

    try {
      await verifyKyc(userId, true);
      setSuccessMessage('KYC documents approved successfully!');
    } catch (err) {
      // Handled by hook
    }
  };

  const handleVerifyVehicle = async (id: string, approve: boolean) => {
    setSuccessMessage('');
    if (!approve) {
      setRejectId(id);
      return;
    }

    try {
      await verifyVehicle(id, true);
      setSuccessMessage('Vehicle approved successfully!');
    } catch (err) {
      // Handled by hook
    }
  };

  const submitRejection = async () => {
    if (!rejectId || !rejectionReason) return;
    setSuccessMessage('');

    try {
      if (activeTab === 'kyc') {
        await verifyKyc(rejectId, false, rejectionReason);
        setSuccessMessage('KYC rejected and user notified.');
      } else {
        await verifyVehicle(rejectId, false, rejectionReason);
        setSuccessMessage('Vehicle rejected and owner notified.');
      }
      setRejectId(null);
      setRejectionReason('');
    } catch (err) {
      // Handled by hook
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '30px' }}>
        <h1>Admin Control Panel</h1>
        <p>Review KYC document submissions and pending vehicle listings before approving public access.</p>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <div className="auth-tabs" style={{ maxWidth: '400px' }}>
        <button
          onClick={() => setActiveTab('kyc')}
          className={`auth-tab ${activeTab === 'kyc' ? 'active' : ''}`}
        >
          KYC Approvals ({pendingKyc.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`auth-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
        >
          Vehicle Approvals ({pendingVehicles.length})
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', marginTop: '40px' }}><div className="loader"></div></div>}

      {/* Rejection Modal/Form */}
      {rejectId && (
        <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--error)' }}>
          <h3>Provide Rejection Reason</h3>
          <p style={{ fontSize: '13px', margin: '4px 0 12px 0', color: 'var(--text-secondary)' }}>
            Please write the rejection reason below. This will be sent as feedback to the owner.
          </p>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Document image is not clear or readable"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={submitRejection} className="btn btn-danger">
              Confirm Rejection
            </button>
            <button onClick={() => { setRejectId(null); setRejectionReason(''); }} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* KYC Table Queue */}
      {!loading && activeTab === 'kyc' && (
        <>
          {pendingKyc.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Pending KYC Submissions</h3>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pendingKyc.map((kyc) => (
                <div key={kyc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4>Aadhaar: {kyc.aadhaarNumber || 'N/A'}</h4>
                      <p style={{ fontSize: '14px' }}>License: {kyc.licenseNumber || 'N/A'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleVerifyKyc(kyc.userId, true)} className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                        Approve
                      </button>
                      <button onClick={() => handleVerifyKyc(kyc.userId, false)} className="btn btn-danger">
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Document Links */}
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    {kyc.aadhaarFrontUrl && (
                      <a href={kyc.aadhaarFrontUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                        🖼️ Aadhaar Front
                      </a>
                    )}
                    {kyc.aadhaarBackUrl && (
                      <a href={kyc.aadhaarBackUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                        🖼️ Aadhaar Back
                      </a>
                    )}
                    {kyc.licenseFrontUrl && (
                      <a href={kyc.licenseFrontUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                        🖼️ License Front
                      </a>
                    )}
                    {kyc.licenseBackUrl && (
                      <a href={kyc.licenseBackUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                        🖼️ License Back
                      </a>
                    )}
                    {kyc.selfieUrl && (
                      <a href={kyc.selfieUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '12px' }}>
                        🤳 Selfie
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Vehicles Table Queue */}
      {!loading && activeTab === 'vehicles' && (
        <>
          {pendingVehicles.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No Pending Vehicle Approvals</h3>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>You're all caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pendingVehicles.map((vehicle) => (
                <div key={vehicle.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4>{vehicle.brand} {vehicle.model} ({vehicle.year})</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        📍 {vehicle.city}, {vehicle.state} | Type: {vehicle.vehicleType}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        License: {vehicle.licensePlate} | RC: {vehicle.registrationNumber}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleVerifyVehicle(vehicle.id, true)} className="btn btn-primary" style={{ backgroundColor: 'var(--success)' }}>
                        Approve
                      </button>
                      <button onClick={() => handleVerifyVehicle(vehicle.id, false)} className="btn btn-danger">
                        Reject
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <strong>Description:</strong> {vehicle.description || 'No description provided.'}
                    {vehicle.features?.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Features:</strong> {vehicle.features.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Vehicle Images preview */}
                  {vehicle.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                      {vehicle.images.map((img) => (
                        <a key={img.id} href={img.url} target="_blank" rel="noreferrer">
                          <img
                            src={img.url}
                            alt="Vehicle Preview"
                            style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
