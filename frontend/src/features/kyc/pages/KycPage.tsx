import React, { useState, useEffect } from 'react';
import { useKyc } from '../hooks/useKyc';

export function KycPage() {
  const { document, loading, error, getStatus, submit, resetError } = useKyc();
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    aadhaarFront: null,
    aadhaarBack: null,
    licenseFront: null,
    licenseBack: null,
    selfie: null,
  });
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    getStatus();
  }, []);

  useEffect(() => {
    if (document) {
      setAadhaarNumber(document.aadhaarNumber || '');
      setLicenseNumber(document.licenseNumber || '');
    }
  }, [document]);

  const handleFileChange = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({
        ...files,
        [name]: e.target.files[0],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetError();
    setSubmittedMessage('');

    if (!aadhaarNumber || !licenseNumber) {
      alert('Please fill out Aadhaar and Driving License numbers');
      return;
    }
    if (!files.aadhaarFront || !files.licenseFront) {
      alert('Please upload Aadhaar Front and License Front images');
      return;
    }

    try {
      await submit({
        aadhaarNumber,
        licenseNumber,
        aadhaarFront: files.aadhaarFront,
        aadhaarBack: files.aadhaarBack || undefined,
        licenseFront: files.licenseFront,
        licenseBack: files.licenseBack || undefined,
        selfie: files.selfie || undefined,
      });
      setSubmittedMessage('KYC Documents submitted successfully for review!');
    } catch {
      // Handled by hook
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '10px' }}>KYC Identity Verification</h2>
        <p style={{ marginBottom: '24px' }}>
          To maintain a secure, peer-to-peer sharing community, all members are required to verify their identity before they can list or swap vehicles.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {submittedMessage && <div className="alert alert-success">{submittedMessage}</div>}

        {/* ── Status View ── */}
        {document && (
          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Current Verification Status:</strong>
                <div style={{ marginTop: '4px' }}>
                  <span className={`badge badge-${document.status.toLowerCase()}`}>
                    {document.status}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Submitted: {new Date(document.submittedAt).toLocaleDateString()}
              </span>
            </div>

            {document.status === 'REJECTED' && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--error-light)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}>
                <strong>Rejection Reason:</strong> {document.rejectionReason || 'No reason provided.'}
                <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 'bold' }}>Please correct the details below and resubmit.</p>
              </div>
            )}

            {document.status === 'APPROVED' && (
              <div style={{ marginTop: '16px', color: 'var(--success)', fontSize: '14px', fontWeight: '600' }}>
                🎉 Your account is fully verified! You can now browse, rent, and list your vehicles.
              </div>
            )}
          </div>
        )}

        {/* ── Submission Form ── */}
        {(!document || document.status === 'REJECTED') && (
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Aadhaar Number (12 Digits)</label>
                <input
                  type="text"
                  maxLength={12}
                  className="form-input"
                  placeholder="123456789012"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driving License Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="DL-1420110012345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            <h4 style={{ margin: '20px 0 10px 0' }}>Upload Document Images</h4>

            <div className="grid-2" style={{ gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Aadhaar Front (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => handleFileChange('aadhaarFront', e)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Back (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => handleFileChange('aadhaarBack', e)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Front (Required)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => handleFileChange('licenseFront', e)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Back (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={(e) => handleFileChange('licenseBack', e)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label className="form-label">Selfie with ID Card (Optional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => handleFileChange('selfie', e)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={loading}
            >
              {loading ? 'Uploading documents...' : 'Submit Verification Docs'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
