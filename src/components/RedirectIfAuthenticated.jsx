import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated} = useSelector((state) => state.auth);
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

export default RedirectIfAuthenticated;
