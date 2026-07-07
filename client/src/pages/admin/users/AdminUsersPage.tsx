import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, Filter, UserPlus, 
  Shield, Ban, RotateCcw, Trash2, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
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

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, searchTerm],
    queryFn: async () => {
      // Assuming a generic API pattern for admin users endpoint
      const response = await apiClient.get('/admin/users', {
        params: { page, limit: 10, search: searchTerm }
      });
      return response.data.data;
    }
  });

  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => apiClient.put(`/admin/users/${userId}/suspend`),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/admin/users/${userId}`),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'User permanently deleted and wiped from MongoDB');
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to permanently delete user');
    }
  });

  const handleSuspend = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to suspend "${userName}"?\n\nThey will be immediately logged out and unable to log in or access the website and dashboard until rolled back.`)) {
      suspendMutation.mutate(userId);
    }
  };

  const handleRollback = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to rollback suspension for "${userName}"?\n\nThey will immediately regain full login and dashboard access.`)) {
      suspendMutation.mutate(userId);
    }
  };

  const users: User[] = data?.users || [];
  const totalPages = data?.totalPages || 1;

  if (isLoading && !users.length) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-primary-600" /> User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage enterprise accounts, roles, and security policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button variant="default" className="gap-2">
            <UserPlus className="h-4 w-4" /> Create User
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search by name, email, or ID..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Users Table */}
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
              {users.map((user) => (
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
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                        Edit
                      </Button>
                      {user.accountStatus === 'suspended' ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Rollback Suspension / Restore Access"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                          onClick={() => handleRollback(user._id, user.fullName)}
                          disabled={suspendMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Suspend User Access"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                          onClick={() => handleSuspend(user._id, user.fullName)}
                          disabled={suspendMutation.isPending}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Delete User Permanently from MongoDB"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        onClick={() => setUserToDelete(user)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-l-md rounded-r-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-r-md rounded-l-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Permanent Delete Confirmation Popup Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/50 dark:bg-[#0d1117] animate-slide-up">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/80">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User Permanently?</h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">Irreversible MongoDB Wipe</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You are about to permanently delete <strong className="text-gray-900 dark:text-white font-bold">{userToDelete.fullName}</strong> (<span className="font-mono text-xs">{userToDelete.email}</span>).
            </p>

            <div className="rounded-xl bg-red-50 p-3.5 border border-red-200/80 text-xs text-red-800 dark:bg-red-950/40 dark:border-red-900/40 dark:text-red-300 mb-6 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span>⚠️ Warning: Complete MongoDB Data Wipe</span>
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-red-700 dark:text-red-300/90">
                <li>User account credentials and profile</li>
                <li>All active refresh & verification tokens</li>
                <li>Registered devices and login sessions</li>
                <li>Submitted FAQ queries & redemptions</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
                onClick={() => {
                  deleteMutation.mutate(userToDelete._id);
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Wiping from MongoDB...' : 'Yes, Delete Permanently'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
