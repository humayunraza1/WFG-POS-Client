// src/Pages/DashboardRouter.jsx
import ManagerDashboard from './ManagerDashbaord';
import POSDashboard from './POSDashboard';
import { useSelector } from 'react-redux';

const DashboardRouter = () => {
  const { user } = useSelector((state)=>state.auth);

  if (!user || !user.access) return null;

  const { isAdmin, isManager } = user.access;

  return isAdmin || isManager ? <ManagerDashboard /> : <POSDashboard />;
};

export default DashboardRouter;
