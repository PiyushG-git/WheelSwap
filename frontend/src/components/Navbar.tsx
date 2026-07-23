import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-accent">Wheel</span>Swap
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-item">Find Vehicles</Link>
          
          {isAuthenticated && (
            <>
              <Link to="/my-vehicles" className="nav-item">My Vehicles</Link>
              <Link to="/kyc" className="nav-item">KYC Status</Link>
            </>
          )}

          {isAdmin && (
            <Link to="/admin" className="nav-item nav-admin-btn">Admin Dashboard</Link>
          )}
        </div>

        <div className="navbar-user-section">
          {isAuthenticated && user ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="profile-link">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <span className="user-name">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/login?tab=register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
