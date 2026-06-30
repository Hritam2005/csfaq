import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/axios';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export const SecuritySettingsPage: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/auth/update-password', data),
    onSuccess: () => {
      toast.success('Password updated successfully');
      reset();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  });

  const onSubmit = (data: PasswordForm) => {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...register('currentPassword')}
            error={errors.currentPassword?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword?.message}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={passwordMutation.isPending}>Update Password</Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/30 dark:bg-gray-900/50">
        <h3 className="mb-2 text-lg font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </div>
    </div>
  );
};
