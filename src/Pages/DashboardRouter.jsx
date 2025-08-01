// src/Pages/DashboardRouter.jsx
import { useAuth } from '@/hooks/useAuth';
import ManagerDashboard from './ManagerDashbaord';
import POSDashboard from './POSDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user || !user.access) return null;

  const { isAdmin, isManager } = user.access;

  return isAdmin || isManager ? <ManagerDashboard /> : <POSDashboard />;
};

export default DashboardRouter;
