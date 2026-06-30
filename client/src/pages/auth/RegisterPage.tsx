import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AuthService } from '../../services/AuthService';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Strong password recommended: Include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) => AuthService.register({ name: data.name, email: data.email, password: data.password }),
    onSuccess: () => {
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    },
    onError: (error: any) => {
      const responseData = error.response?.data;
      if (responseData?.errors && responseData.errors.length > 0) {
        toast.error(responseData.errors[0]);
      } else {
        toast.error(responseData?.message || 'Failed to register');
      }
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    // This is a placeholder for Google Login integration
    toast.info('Google login is not yet configured. Please create an account.');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Join your organization's workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Doe"
          {...register('name')}
          error={errors.name?.message}
        />
        
        <Input
          label="Email"
          type="email"
          placeholder="jane.doe@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
          Create Account
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
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
          Sign in
        </Link>
      </div>
    </div>
  );
};
