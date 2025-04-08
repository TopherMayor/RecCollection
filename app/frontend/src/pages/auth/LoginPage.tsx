import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, loading } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await login({ email, password });
    
    if (success) {
      showToast('Logged in successfully', 'success');
      navigate('/');
    }
  };
  
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle={
        <>
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
        </div>
        
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <div>
          <Button type="submit" fullWidth isLoading={loading}>
            Sign in
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
