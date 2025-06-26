import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin');
    } catch (err) {
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      if (err instanceof Error) {
        // Default to the error's message if it's more specific than the generic one
        errorMessage = err.message || errorMessage;

        // Check for Supabase AuthApiError specifics or network issues
        // Supabase AuthError often has a __isAuthError property or specific name/status
        if ((err as any).__isAuthError || err.name === 'AuthApiError' || err.name === 'AuthRetryableFetchError') {
          const authError = err as any; // Type assertion to access status
          if (authError.status === 400) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (authError.status === 401 || authError.status === 403) {
            errorMessage = 'Authentication issue detected. Your session might be invalid. Please try refreshing the page and signing in again.';
          } else if (authError.status >= 500) {
            errorMessage = 'A server error occurred. Please try again later or refresh the page.';
          } else if (authError.status === 429) { // Too many requests
             errorMessage = 'Too many attempts. Please try again later.';
          }
        } else if (err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again. Refreshing the page may also help.';
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            icon={<LogIn className="h-4 w-4" />}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;