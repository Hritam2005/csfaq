import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthService } from '../../services/AuthService';
import { setCredentials } from '../../store/slices/authSlice';

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

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) => AuthService.login(data.email, data.password),
    onSuccess: (res) => {
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      toast.success('Successfully logged in');
      const role = res.data.user.role?.toLowerCase() || '';
      if (role.includes('admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
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

  const handleGoogleLogin = () => {
    const email = prompt("Google Sign-In Mock\n\nPlease enter a Google Email address:");
    if (!email) return;
    const name = email.split('@')[0];
    
    // Create a temporary mutation to handle this
    toast.promise(
      AuthService.googleLogin(email, name).then((res) => {
        dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
        const role = res.data.user.role?.toLowerCase() || '';
        if (role.includes('admin')) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }),
      {
        loading: 'Authenticating with Google...',
        success: 'Successfully logged in with Google!',
        error: (err) => err.response?.data?.message || 'Failed to authenticate with Google'
      }
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>

      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 dark:bg-gray-800">
        <button
          onClick={() => setLoginType('user')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            loginType === 'user'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          User Sign In
        </button>
        <button
          onClick={() => setLoginType('admin')}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            loginType === 'admin'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          Admin Sign In
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder={loginType === 'admin' ? "admin@enterprise.com" : "name@enterprise.com"}
          {...register('email')}
          error={errors.email?.message}
        />
        
        <div className="relative">
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm font-medium text-red-500 dark:text-red-400">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
          {loginType === 'admin' ? 'Sign in as Admin' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        <div className="px-4 text-sm text-gray-500 dark:text-gray-400">OR</div>
        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
      </div>

      <div className="mt-6">
        <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
          Create account
        </Link>
      </div>
    </div>
  );
};
