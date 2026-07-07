import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthService } from '../../services/AuthService';
import { setCredentials } from '../../store/slices/authSlice';
import { useGoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const passwordValue = watch('password') || '';

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculateStrength(passwordValue);

  const getStrengthLabel = (score: number) => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-gray-200 dark:bg-gray-800';
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthTextClass = (score: number) => {
    if (score === 0) return 'text-gray-500';
    if (score <= 2) return 'text-red-500';
    if (score <= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => AuthService.login(data.email, data.password, loginType),
    onSuccess: (res) => {
      const role = res.data.user.role?.toLowerCase() || '';
      const isAdmin = role.includes('admin');

      // Frontend validation check
      if (loginType === 'admin' && !isAdmin) {
        AuthService.logout().catch(() => {});
        toast.error('Access denied. Admin credentials required.');
        return;
      }
      if (loginType === 'user' && isAdmin) {
        AuthService.logout().catch(() => {});
        toast.error('Please use the Admin Sign In portal.');
        return;
      }

      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success('Successfully logged in');
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        toast.error(responseData.errors[0]);
      } else {
        toast.error(responseData?.message || 'Failed to login');
      }
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      toast.promise(
        AuthService.googleLogin(tokenResponse.access_token, loginType, 'login').then((res) => {
          const role = res.data.user.role?.toLowerCase() || '';
          const isAdmin = role.includes('admin');

          // Frontend validation check - forbid admin login via Google
          if (loginType === 'admin' || isAdmin) {
            AuthService.logout().catch(() => {});
            throw new Error('Google Sign-In is disabled for Admin accounts. Please use email and password.');
          }

          dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
          navigate('/', { replace: true });
        }).catch((err: any) => {
          const msg = err.response?.data?.message || err.message || '';
          if (err.response?.status === 404 || msg.toLowerCase().includes('create an account') || msg.toLowerCase().includes('no account found')) {
            setTimeout(() => {
              navigate('/register');
            }, 2000);
          }
          throw err;
        }),
        {
          loading: 'Authenticating with Google...',
          success: 'Successfully logged in with Google!',
          error: (err: any) => err.response?.data?.message || err.message || 'Failed to authenticate with Google'
        }
      );
    },
    onError: () => toast.error('Google Sign-In failed or was canceled'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 shadow-2xl p-6 sm:p-8 rounded-2xl relative overflow-hidden w-full"
    >
      {/* Decorative inner gradient orb */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary-500/10 dark:bg-cyan-500/15 blur-2xl rounded-full pointer-events-none -z-10" />
      
      <div className="relative z-10 space-y-6">
        
        {/* Welcome Text */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            {loginType === 'admin' ? (
              <>
                <ShieldAlert className="h-7 w-7 text-amber-500 animate-pulse" />
                <span>Admin Portal</span>
              </>
            ) : (
              <span>Welcome back</span>
            )}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {loginType === 'admin' ? 'Access system telemetry and controls' : 'Sign in to your VINS account'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-lg bg-gray-100/80 p-1 dark:bg-gray-850 border border-gray-200/30 dark:border-gray-800/30">
          <button
            type="button"
            onClick={() => setLoginType('user')}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition-all duration-300 ${
              loginType === 'user'
                ? 'bg-white text-primary-700 shadow dark:bg-gray-700 dark:text-cyan-300'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            User Sign In
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition-all duration-300 ${
              loginType === 'admin'
                ? 'bg-white text-amber-600 shadow dark:bg-gray-700 dark:text-amber-400'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Admin Portal
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              className="focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:focus:ring-primary-400 dark:bg-gray-950 dark:border-gray-800 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-700 shadow-sm"
              {...register('email')}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                Forgot password?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-950 dark:text-white dark:border-gray-800 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-700 shadow-sm ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {errors.password && <p className="mt-1 text-xs font-bold text-red-500 dark:text-red-400">{errors.password.message}</p>}
            
            {/* Strength indicator */}
            {passwordValue && (
              <div className="mt-2.5 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-200/50 dark:border-gray-800/40 p-2 rounded-lg">
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span className="text-gray-500 dark:text-gray-400">Password strength</span>
                  <span className={`font-bold uppercase tracking-wider ${getStrengthTextClass(strengthScore)}`}>{getStrengthLabel(strengthScore)}</span>
                </div>
                <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                  <div className={`h-full ${strengthScore >= 1 ? getStrengthColor(strengthScore) : 'bg-transparent'} transition-all w-1/5`}></div>
                  <div className={`h-full ${strengthScore >= 2 ? getStrengthColor(strengthScore) : 'bg-transparent'} transition-all w-1/5`}></div>
                  <div className={`h-full ${strengthScore >= 3 ? getStrengthColor(strengthScore) : 'bg-transparent'} transition-all w-1/5`}></div>
                  <div className={`h-full ${strengthScore >= 4 ? getStrengthColor(strengthScore) : 'bg-transparent'} transition-all w-1/5`}></div>
                  <div className={`h-full ${strengthScore >= 5 ? getStrengthColor(strengthScore) : 'bg-transparent'} transition-all w-1/5`}></div>
                </div>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-base font-bold shadow-md hover:shadow-lg transition-all" isLoading={loginMutation.isPending}>
            {loginType === 'admin' ? 'Sign in to Admin Dashboard' : 'Sign in to Workspace'}
          </Button>
        </form>

        {/* Divider & Oauth */}
        {loginType === 'user' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              <div className="px-3 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">OR</div>
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            <Button variant="outline" className="w-full h-11 flex items-center justify-center gap-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-950/50 shadow-sm transition-all font-bold" onClick={() => loginWithGoogle()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        )}

        {/* Create Account Link */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-150/40 dark:border-gray-800/40">
          Don't have an VINS account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-cyan-400 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
