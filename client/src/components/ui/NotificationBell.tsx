import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../providers/SocketProvider';
import { Button } from './Button';
import toast from 'react-hot-toast';

export const NotificationBell: React.FC = () => {
  const { socket, adminSocket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleNotification = (payload: any) => {
      setUnreadCount((prev) => prev + 1);
      toast.success(payload.title || 'New Notification');
    };

    if (socket) {
      socket.on('notification', handleNotification);
    }
    
    if (adminSocket) {
      // adminSocket also receives system_alert
      adminSocket.on('system_alert', (_payload: any) => {
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) socket.off('notification', handleNotification);
      if (adminSocket) adminSocket.off('system_alert');
    };
  }, [socket, adminSocket]);

  const handleReset = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={handleReset}>
        <Bell className="h-5 w-5" />
      </Button>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};
