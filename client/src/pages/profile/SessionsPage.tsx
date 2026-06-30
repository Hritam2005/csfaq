import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Laptop, Smartphone, Trash2 } from 'lucide-react';
import { AuthService } from '../../services/AuthService';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';

export const SessionsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: AuthService.getSessions
  });

  const revokeMutation = useMutation({
    mutationFn: AuthService.terminateSession,
    onSuccess: () => {
      toast.success('Session terminated');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: () => toast.error('Failed to terminate session')
  });

  const sessions = response?.data || [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Sessions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          These devices are currently logged into your account. Terminate any unfamiliar sessions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: any) => {
            const isMobile = /mobile/i.test(session.device || '');
            return (
              <div key={session._id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {isMobile ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {session.os || 'Unknown OS'} &bull; {session.browser || 'Unknown Browser'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      IP: {session.ipAddress} &bull; Last active: {new Date(session.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {session.isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    onClick={() => revokeMutation.mutate(session._id)}
                    isLoading={revokeMutation.isPending && revokeMutation.variables === session._id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Revoke
                  </Button>
                ) : (
                  <span className="text-sm text-gray-400">Expired</span>
                )}
              </div>
            );
          })}
          {sessions.length === 0 && <p className="text-sm text-gray-500">No active sessions found.</p>}
        </div>
      )}
    </div>
  );
};
