import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProfilePage() {
  const { user, update, changeAvatar, error, resetError, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    city: user?.city || '',
    state: user?.state || '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    resetError();

    try {
      if (avatarFile) {
        await changeAvatar(avatarFile);
        setAvatarFile(null);
      }
      await update(formData);
      setSuccessMsg('Profile updated successfully!');
    } catch {
      // Handled by Redux
    }
  };

  if (!user) return null;

  return (
    <div className="main-content">
      <div className="grid-2">
        {/* Left Side: Avatar & Details Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '800' }}>
                {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
          </div>

          <div>
            <h2>{user.name}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{user.email}</p>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${user.isKycVerified ? 'badge-approved' : 'badge-pending'}`}>
                {user.isKycVerified ? 'KYC Verified' : 'KYC Pending'}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p><strong>Account Role:</strong> {user.role}</p>
            <p><strong>Email Status:</strong> {user.isEmailVerified ? '✅ Verified' : '❌ Unverified'}</p>
            <p><strong>Location:</strong> {user.city ? `${user.city}, ${user.state}` : 'Not specified'}</p>
          </div>

          {!user.isKycVerified && (
            <Link to="/kyc" className="btn btn-primary" style={{ width: '100%' }}>
              Complete KYC Verification
            </Link>
          )}
        </div>

        {/* Right Side: Edit Form Card */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Edit Profile Information</h3>

          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Upload New Avatar</label>
              <input type="file" accept="image/*" className="form-input" onChange={handleAvatarChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" name="city" className="form-input" value={formData.city} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" name="state" className="form-input" value={formData.state} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Short Bio</label>
              <textarea name="bio" className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={formData.bio} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
