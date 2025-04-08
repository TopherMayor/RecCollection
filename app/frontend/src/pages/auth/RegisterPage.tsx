import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { register, loading } = useAuth();
  const { showToast } = useUI();
  const navigate = useNavigate();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const success = await register({
      username,
      email,
      password,
      displayName: displayName || undefined,
    });
    
    if (success) {
      showToast('Account created successfully', 'success');
      navigate('/');
    }
  };
  
  return (
    <AuthLayout
      title="Create a new account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Input
            id="username"
            name="username"
            type="text"
            label="Username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
          />
        </div>
        
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
            id="display-name"
            name="display-name"
            type="text"
            label="Display Name (optional)"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
          />
        </div>
        
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
        </div>
        
        <div>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            label="Confirm Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />
        </div>
        
        <div>
          <Button type="submit" fullWidth isLoading={loading}>
            Create account
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
