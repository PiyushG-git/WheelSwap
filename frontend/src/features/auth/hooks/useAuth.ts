import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  updateProfile,
  uploadAvatar,
  clearError,
  localLogout,
} from '../state/authSlice';
import { getLocalRefreshToken } from '../../../utils/http';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error, initialized } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: any) => {
    return dispatch(loginUser(credentials)).unwrap();
  };

  const register = async (userData: any) => {
    return dispatch(registerUser(userData)).unwrap();
  };

  const fetchMe = () => {
    dispatch(fetchCurrentUser());
  };

  const logout = () => {
    const refreshToken = getLocalRefreshToken();
    if (refreshToken) {
      dispatch(logoutUser(refreshToken));
    } else {
      dispatch(localLogout());
    }
  };

  const update = async (data: any) => {
    return dispatch(updateProfile(data)).unwrap();
  };

  const changeAvatar = async (file: File) => {
    return dispatch(uploadAvatar(file)).unwrap();
  };

  const resetError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    login,
    register,
    fetchMe,
    logout,
    update,
    changeAvatar,
    resetError,
  };
}
