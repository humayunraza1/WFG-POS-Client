import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const location = useLocation();
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState({
    login: false,
    create: false,
    confirm: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Clear errors when component mounts or forms change
  useEffect(() => {
    clearError();
    setCreateError('');
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!loginForm.username || !loginForm.password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(loginForm.username, loginForm.password);
      if (result.success) {
        // Redirect will happen automatically due to isAuthenticated change
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginInputChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    clearError();
  };


  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src='/images/wfg-logo.png' className='h-35 w-35'/>
          </div>
          <h1 className="text-3xl font-bold">POS System</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Sign in to access your POS dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => handleLoginInputChange('username', e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword.login ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => handleLoginInputChange('password', e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('login')}
                        disabled={isSubmitting}
                      >
                        {showPassword.login ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !loginForm.username || !loginForm.password}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>POS System © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;