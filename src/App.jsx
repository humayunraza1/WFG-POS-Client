import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './Pages/Login';
import Report from './Pages/Report';
import DashboardRouter from './Pages/DashboardRouter';
import AxiosInterceptorProvider from './contexts/AxiosInterceptorProvider';
import TempOrdersProvider from './hooks/useTempOrders.jsx';
import {Provider} from 'react-redux'
import { store } from './app/store.js';
import AppInitializer from './components/AppInitializer.jsx';
function App() {
  return (
    <Provider store={store}>
      <TempOrdersProvider>
      <AxiosInterceptorProvider />
      <Toaster richColors position="top-right" />
      <AppInitializer />
      <Routes>
        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected report route */}
        <Route 
          path="/report/:id" 
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          } 
          />
        
        {/* Protected dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter/>
            </ProtectedRoute>
          } 
          />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
        </TempOrdersProvider>
  </Provider>
  );
}

export default App;