import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    onSuccess: () => {
      toast.success('If an account exists, a recovery email has been sent.');
    },
    onError: () => {
      toast.error('Failed to process request. Please try again later.');
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.email);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we'll send you instructions to reset your password.
        </p>
      </div>

      {forgotPasswordMutation.isSuccess ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/10">
          <h3 className="text-sm font-semibold text-green-800 dark:text-green-400">Check your email</h3>
          <p className="mt-2 text-sm text-green-700 dark:text-green-500">
            We've sent password reset instructions to your email address.
          </p>
          <div className="mt-4">
            <Link to="/login" className="text-sm font-medium text-green-800 hover:text-green-700 dark:text-green-400">
              &larr; Back to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="name@enterprise.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Button type="submit" className="w-full" isLoading={forgotPasswordMutation.isPending}>
            Send Reset Instructions
          </Button>
        </form>
      )}

      {!forgotPasswordMutation.isSuccess && (
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
};
