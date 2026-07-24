import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const QUICK_CITIES = ['Delhi', 'Noida', 'Agra'];

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [city, setCity] = useState('');

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      navigate(`/vehicles?city=${encodeURIComponent(city.trim())}`);
    } else {
      navigate('/vehicles');
    }
  };

  const handleQuickCity = (cityName: string) => {
    navigate(`/vehicles?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="homepage-container">
      {/* ── 1. Hero Section ── */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">✨ Peer-to-Peer Vehicle Sharing</span>
          <h1 className="hero-title">
            Swap Your Keys. <br />
            <span className="brand-accent">Explore New Journeys.</span>
          </h1>
          <p className="hero-subtitle">
            Trade your everyday sedan for an SUV for the weekend, or rent premium vehicles directly from trusted local hosts in Delhi NCR, Noida, & Agra.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-box card">
            <div className="search-input-group">
              <span className="search-icon">📍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Where are you looking for a vehicle? (e.g. Delhi, Noida, Agra)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary hero-search-btn">
              Search Vehicles
            </button>
          </form>

          {/* Quick Search Tag Chips */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', marginTop: '6px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Popular:</span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleQuickCity(c)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: 'var(--brand-primary)',
                }}
              >
                📍 {c}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card card">
            <div className="visual-badge">🚘 Top Rated Swap</div>
            <img
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
              alt="Featured SUV"
              className="visual-img"
            />
            <div className="visual-details">
              <h4>Mahindra Thar 4x4</h4>
              <p>Host: Karan M. • Verified Swap Partner in Delhi</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. How It Works Section ── */}
      <section className="steps-section">
        <div className="section-header">
          <h2>How WheelSwap Works</h2>
          <p>Get ready to hit the road in three simple, secure steps.</p>
        </div>

        <div className="grid-3">
          <div className="step-card card">
            <div className="step-number">1</div>
            <h3>Verify Identity</h3>
            <p>Upload your Aadhaar and Driving License. Our team manually verifies your details in minutes to ensure community safety.</p>
          </div>

          <div className="step-card card">
            <div className="step-number">2</div>
            <h3>List Your Ride</h3>
            <p>Add specifications, upload photos, and block dates on your calendar when you plan to use your vehicle yourself.</p>
          </div>

          <div className="step-card card">
            <div className="step-number">3</div>
            <h3>Swap or Rent</h3>
            <p>Search for matching vehicles in your area. Initiate a swap request with other owners or book rentals instantly.</p>
          </div>
        </div>
      </section>

      {/* ── 3. Value Proposition Section ── */}
      <section className="value-section card">
        <div className="grid-2" style={{ alignItems: 'center', gap: '40px' }}>
          <div>
            <span className="hero-tagline">Why Choose Us</span>
            <h2 style={{ fontSize: '32px', marginTop: '10px', marginBottom: '20px' }}>Built for Trusted Swapping</h2>

            <div className="value-item">
              <span className="value-icon">🛡️</span>
              <div>
                <h4>Verified Profiles (KYC)</h4>
                <p>Only users with manually approved identity documents can see addresses or initiate swaps.</p>
              </div>
            </div>

            <div className="value-item" style={{ marginTop: '20px' }}>
              <span className="value-icon">⚡</span>
              <div>
                <h4>Zero-Cost Swaps</h4>
                <p>Temporarily trade vehicles of similar tiers with other verified owners with no rental fees.</p>
              </div>
            </div>

            <div className="value-item" style={{ marginTop: '20px' }}>
              <span className="value-icon">📅</span>
              <div>
                <h4>Smart Calendar Control</h4>
                <p>Easily block out days on your vehicle's calendar when you need it for personal commutes.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=500&q=80"
              alt="Keys exchange"
              style={{ width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}
            />
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action ── */}
      <section className="cta-section">
        <h2>List your vehicle and start swapping today</h2>
        <p>Join the trusted community of vehicle owners sharing rides in Delhi NCR, Noida, and Agra.</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '24px' }}>
          {isAuthenticated ? (
            <Link to="/my-vehicles/add" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              List Your Vehicle
            </Link>
          ) : (
            <>
              <Link to="/login?tab=register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Create Free Account
              </Link>
              <Link to="/vehicles" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Browse Vehicles
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
