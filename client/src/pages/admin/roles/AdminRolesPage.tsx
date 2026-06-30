import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../../../services/axios';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { PageLoader } from '../../../components/providers/PageLoader';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: { _id: string; name: string }[];
  isSystem: boolean;
  userCount?: number;
}

export const AdminRolesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: roles, isLoading } = useQuery<Role[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/roles');
      return response.data.data;
    }
  });

  const filteredRoles = roles?.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" /> Role Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Define system roles and their associated permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" /> Create Role
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search roles..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

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
    </div>
  );
};
