// components/LoginPage.tsx
import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import Card from './shared/Card';
import Spinner from './shared/Spinner';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authService.login(email, password); // calls backend
      if (result.user && result.token) {
        localStorage.setItem('astralex_token', result.token); // store token
        onLogin(result.user); // pass user to parent
      } else {
        setError('Login failed: Invalid response from server.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in mx-auto mt-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tighter text-white">
          <span className="text-orange-500">Astra</span>Lex
        </h1>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600"
            >
              {isLoading ? <Spinner /> : 'Login'}
            </button>
          </div>

          <p className="text-sm text-center text-gray-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-medium text-orange-500 hover:text-orange-400"
            >
              Sign up
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
