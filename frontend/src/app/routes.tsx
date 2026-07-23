import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/vehicles/pages/HomePage';
import { SearchPage } from '../features/vehicles/pages/SearchPage';
import { VehicleDetailPage } from '../features/vehicles/pages/VehicleDetailPage';
import { MyVehiclesPage } from '../features/vehicles/pages/MyVehiclesPage';
import { AddVehiclePage } from '../features/vehicles/pages/AddVehiclePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { KycPage } from '../features/kyc/pages/KycPage';
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { ProtectedRoute, AdminRoute } from '../components/RouteGuards';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/vehicles" element={<SearchPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

      {/* Protected User Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <KycPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-vehicles"
        element={
          <ProtectedRoute>
            <MyVehiclesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-vehicles/add"
        element={
          <ProtectedRoute>
            <AddVehiclePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Fallback to home */}
      <Route path="*" element={<SearchPage />} />
    </Routes>
  );
}
