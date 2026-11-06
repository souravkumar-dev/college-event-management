import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, homeFor } from '../../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}
