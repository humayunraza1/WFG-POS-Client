import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './Pages/Login';
import POSDashboard from './Pages/POSDashboard';
import Report from './Pages/Report';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
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
              <POSDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;