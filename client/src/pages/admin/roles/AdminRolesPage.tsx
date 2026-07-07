import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Search, Plus, Edit2, Trash2, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../../services/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PageLoader } from '../../../components/providers/PageLoader';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: { _id: string; name: string };
  accountStatus: 'active' | 'inactive' | 'suspended' | 'locked';
  lastLogin: string | null;
  createdAt: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: { _id: string; name: string }[];
  isSystem: boolean;
  userCount?: number;
}

export const AdminRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/roles');
      return response.data.data;
    }
  });

  const { data: userData, isLoading: usersLoading } = useQuery<{ users: User[] }>({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data.data;
    },
    enabled: activeTab === 'users'
  });

  const removeUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success('User excused from the internship successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove user');
    }
  });

  const handleRemoveUser = (userId: string) => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to excuse this user from the internship? This will permanently delete their account and reset all their progress and points. This action is IRREVERSIBLE!')) {
      removeUserMutation.mutate(userId);
    }
  };

  const filteredRoles = roles?.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredUsers = userData?.users?.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isCurrentTabLoading = activeTab === 'roles' ? rolesLoading : usersLoading;

  if (isCurrentTabLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            {activeTab === 'roles' ? 'Role Management' : 'User Status & Actions'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'roles'
              ? 'Define system roles and their associated permissions.'
              : 'View and manage active users, statuses, and internship permissions.'}
          </p>
        </div>
        {activeTab === 'roles' && (
          <div className="flex items-center gap-3">
            <Button variant="default" className="gap-2">
              <Plus className="h-4 w-4" /> Create Role
            </Button>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            setActiveTab('roles');
            setSearchTerm('');
          }}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => {
            setActiveTab('users');
            setSearchTerm('');
          }}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Active Users
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder={activeTab === 'roles' ? 'Search roles...' : 'Search users by name, email, or role...'} 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'roles' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div key={role._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        System
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Permissions ({role.permissions?.length || 0})</div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions?.slice(0, 5).map(p => (
                    <span key={p._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800/30 dark:text-primary-400">
                      {p.name}
                    </span>
                  ))}
                  {role.permissions?.length > 5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                  {(!role.permissions || role.permissions.length === 0) && (
                    <span className="text-sm text-gray-500 italic">No permissions assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {role.userCount || 0} users assigned
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold dark:bg-primary-900/50 dark:text-primary-400">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                        <Shield className="h-4 w-4 text-gray-400" />
                        {user.role?.name || 'Standard User'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.accountStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${user.accountStatus === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        ${user.accountStatus === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' : ''}
                      `}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role?.name !== 'Super Admin' ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 gap-2"
                          onClick={() => handleRemoveUser(user._id)}
                        >
                          <UserMinus className="h-4 w-4" /> Remove User
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No active users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
