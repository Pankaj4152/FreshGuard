import React, { useState } from 'react';
import { Eye, EyeOff } from 'react-feather';

const walmartBlue = '#0071CE';
const walmartGray = '#f5f6f7';
const walmartBorder = '#e0e0e0';

const validateEmailOrPhone = (value) => {
  // Simple email or phone validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{10,15}$/;
  return emailRegex.test(value) || phoneRegex.test(value);
};

const SignIn = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validateEmailOrPhone(emailOrPhone)) {
      setError('Please enter a valid email or phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    // Simulate login (replace with real backend or Firebase Auth)
    setTimeout(() => {
      setLoading(false);
      if (emailOrPhone === 'demo@walmart.com' && password === 'password123') {
        setSuccess(true);
      } else {
        setError('Invalid credentials. Please try again.');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border" style={{ borderColor: walmartBorder }}>
        {/* Walmart Logo */}
        <div className="flex justify-center mb-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Walmart_logo.svg" alt="Walmart Logo" className="h-10" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: walmartBlue }}>Sign in to your account</h2>
        <form className="mt-6" onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Email or mobile number</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50"
              style={{ borderColor: walmartBorder }}
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="mb-2 relative">
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 pr-10"
              style={{ borderColor: walmartBorder }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
            <span
              className="absolute right-3 top-9 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          <div className="flex items-center justify-between mb-4 mt-2">
            <label className="flex items-center text-gray-700 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <a href="#" className="text-blue-600 text-sm hover:underline">Forgot password?</a>
          </div>
          {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-sm text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-3 text-sm text-center">Sign in successful!</div>}
          <button
            type="submit"
            className="w-full py-2 mt-2 rounded text-white font-semibold text-lg transition-colors duration-200"
            style={{ background: walmartBlue, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? <span className="animate-spin mr-2 inline-block align-middle"><svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></span> : null}
            Sign In
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-3 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="text-center">
          <a href="#" className="text-blue-600 font-semibold hover:underline">Create an account</a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
