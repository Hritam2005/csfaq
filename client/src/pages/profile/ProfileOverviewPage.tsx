import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Upload, Trash2 } from 'lucide-react';
import { RootState } from '../../store/store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../services/axios';
import { setCredentials } from '../../store/slices/authSlice';

export const ProfileOverviewPage: React.FC = () => {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.fullName || user?.name || '');
  const [title, setTitle] = useState(user?.profile?.title || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/users/me', data),
    onSuccess: (res) => {
      // Update local Redux state with new user object
      dispatch(setCredentials({ user: res.data.data, token: token! }));
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, profile: { title, bio } });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Profile Picture</h3>
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/50 dark:text-primary-400">
            {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" /> Upload new
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Info Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Personal Information</h3>
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={user.email} 
            disabled 
            className="bg-gray-50 dark:bg-gray-800" 
          />
          <Input 
            label="Job Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g. Senior Software Engineer"
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={updateProfileMutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
};
