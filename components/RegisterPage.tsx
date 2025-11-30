// components/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { User } from "../types";
import * as authService from "../services/authService";
import Card from "./shared/Card";
import Spinner from "./shared/Spinner";

interface RegisterPageProps {
  onRegister: (user: User) => void;
  onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateCaptcha = () => {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptcha(randomString);
  };

  useEffect(() => generateCaptcha(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput.toUpperCase() !== captcha) {
      setError("CAPTCHA does not match.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await authService.register(name, email, password);
      if (result.user && result.token) {
        localStorage.setItem("astralex_token", result.token);
        onRegister(result.user);
      } else {
        setError("Registration failed: Invalid server response.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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
        <p className="text-gray-400 mt-2">Create your account</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
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
              placeholder="********"
              required
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="captcha" className="block text-sm font-medium text-gray-300 mb-1">
              CAPTCHA
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-4 py-2 bg-gray-600 rounded font-mono text-white tracking-widest">{captcha}</span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-2 py-1 text-sm text-orange-500 hover:text-orange-400 border border-gray-500 rounded"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              id="captchaInput"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter CAPTCHA"
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
              {isLoading ? <Spinner /> : 'Register'}
            </button>
          </div>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-medium text-orange-500 hover:text-orange-400"
            >
              Sign in
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
