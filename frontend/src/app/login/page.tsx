'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { loginRequest } from '../../features/auth/slice';
import { useRouter } from 'next/navigation';
import { Alert } from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  MailOutlined as MailOutlineIcon,
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { registerApi } from '../../api/auth';
import Input from '../../components/Input';
import Button from '../../components/Button';

function UserLoginContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpTab, setIsSignUpTab] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    setSignUpError(null);
    try {
      await registerApi({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });
      // Auto login upon successful sign up
      dispatch(loginRequest({ email: signUpEmail, password: signUpPassword }));
    } catch (err: any) {
      setSignUpError(err.message || 'Registration failed');
    } finally {
      setSignUpLoading(false);
    }
  };

  // Role-based redirect after login
  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'admin' || role === 'employee') {
        // Redirect to admin panel internally (no page reload)
        router.push('/admin');
      } else {
        // Regular customer → account page
        router.push('/account');
      }
    }
  }, [user, router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email, password }));
  };

  return (
    <main className="flex-1 flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 py-12 px-4 select-none">
      <div className="max-w-[440px] w-full flex flex-col gap-5">

        {/* Card Container */}
        <div className="bg-white border border-zinc-200/60 rounded-[32px] p-8 sm:p-10 shadow-lg shadow-zinc-200/40 flex flex-col">

          {/* Logo & Branding */}
          <div className="flex flex-col items-center gap-3 mb-7">
            <div className="bg-zinc-950 text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-950/20 ring-4 ring-zinc-100">
              <ShoppingBagIcon sx={{ fontSize: 26 }} />
            </div>
            <span className="text-xl font-black text-zinc-900 tracking-tight leading-tight block">ZSurban</span>
          </div>

          {/* Login / Sign Up Tab Switcher */}
          <div className="bg-zinc-100 p-1 rounded-full flex gap-1 mb-7 border border-zinc-200/50">
            <button
              type="button"
              onClick={() => setIsSignUpTab(false)}
              className={`flex-1 py-2.5 text-2xs font-extrabold text-center rounded-full transition-all duration-200 cursor-pointer ${
                !isSignUpTab
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignUpTab(true)}
              className={`flex-1 py-2.5 text-2xs font-extrabold text-center rounded-full transition-all duration-200 cursor-pointer ${
                isSignUpTab
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {isSignUpTab ? (
            /* ── Sign Up Form ── */
            <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-4 text-left">
              <div className="text-center mb-1">
                <h1 className="text-xl font-black text-zinc-900 tracking-tight">Create account</h1>
                <p className="text-2xs text-zinc-400 font-bold mt-1.5">Join ZSurban and start shopping today</p>
              </div>

              {signUpError && (
                <Alert severity="error" className="rounded-2xl text-xs font-semibold">
                  {signUpError}
                </Alert>
              )}

              <Input
                id="su-name"
                type="text"
                required
                label="Full Name"
                placeholder="Enter your full name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                icon={<PersonIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
              />

              <Input
                id="su-email"
                type="email"
                required
                label="Email Address"
                placeholder="Enter your email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                icon={<MailOutlineIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
              />

              <Input
                id="su-password"
                type={showSignUpPassword ? 'text' : 'password'}
                required
                label="Password"
                placeholder="Create a password (min 6 chars)"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                icon={<LockOutlinedIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="text-zinc-400 hover:text-zinc-700 cursor-pointer focus:outline-none shrink-0"
                  >
                    {showSignUpPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="dark"
                fullWidth
                loading={signUpLoading}
                className="py-3.5 mt-2 rounded-2xl text-sm tracking-wide"
              >
                Create Account
              </Button>
            </form>
          ) : (
            /* ── Login Form ── */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="text-center mb-1">
                <h1 className="text-xl font-black text-zinc-900 tracking-tight">Welcome back!</h1>
                <p className="text-2xs text-zinc-400 font-bold mt-1.5">Sign in to your account to continue</p>
              </div>

              {error && (
                <Alert severity="error" className="rounded-2xl text-xs font-semibold">
                  {error}
                </Alert>
              )}

              <Input
                id="email"
                type="email"
                required
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<MailOutlineIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
              />

              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<LockOutlinedIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-700 cursor-pointer focus:outline-none shrink-0"
                  >
                    {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                  </button>
                }
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-2xs mt-0.5">
                <label className="flex items-center gap-2 font-bold text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 border-zinc-300 rounded accent-zinc-900"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-[#00b884] hover:text-[#00a374] hover:underline font-extrabold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                variant="dark"
                fullWidth
                loading={loading}
                className="py-3.5 mt-2 rounded-2xl text-sm tracking-wide"
              >
                Login
              </Button>
            </form>
          )}

          {/* Switch Tab Link */}
          <div className="text-2xs text-zinc-400 font-bold text-center mt-7">
            <span>
              {isSignUpTab ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUpTab(!isSignUpTab)}
              className="text-[#00b884] hover:text-[#00a374] hover:underline ml-1.5 font-extrabold cursor-pointer"
            >
              {isSignUpTab ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Role info hint */}
        <p className="text-center text-[10px] text-zinc-400 font-medium px-4">
          Admins and employees will be redirected to the management portal automatically.
        </p>
      </div>
    </main>
  );
}

export default function UserLoginPage() {
  return <UserLoginContent />;
}
