import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppRoutes } from './app/routes';
import { Navbar } from './components/Navbar';
import { useAuth } from './features/auth/hooks/useAuth';
import { localLogout } from './features/auth/state/authSlice';

function AppContent() {
  const { fetchMe } = useAuth();

  useEffect(() => {
    // Attempt auto-login on application startup
    fetchMe();

    // Listen to token expiration logouts from Axios interceptor
    const handleForceLogout = () => {
      store.dispatch(localLogout());
    };

    window.addEventListener('auth-logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth-logout', handleForceLogout);
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content-wrapper">
        <AppRoutes />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
