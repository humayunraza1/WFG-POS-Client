import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;
