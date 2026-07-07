import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '../providers/SocketProvider';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { apiClient } from '../../services/axios';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { socket, adminSocket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const [countRes, listRes] = await Promise.all([
          apiClient.get('/notifications/unread-count'),
          apiClient.get('/notifications')
        ]);
        setUnreadCount(countRes.data.data.count || 0);
        setNotifications(listRes.data.data || []);
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };
    initNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNotification = (payload: any) => {
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(payload.title || 'New Notification');
    };

    if (socket) {
      socket.on('notification', handleNotification);
    }
    
    if (adminSocket) {
      adminSocket.on('system_alert', (payload: any) => {
        setNotifications((prev) => [
          {
            _id: Math.random().toString(),
            title: payload.title,
            message: payload.message,
            type: payload.type,
            isRead: false,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        setUnreadCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socket) socket.off('notification', handleNotification);
      if (adminSocket) adminSocket.off('system_alert');
    };
  }, [socket, adminSocket]);

  const toggleDropdown = async () => {
    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    if (nextOpenState && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      try {
        await apiClient.put('/notifications/mark-all-read');
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={toggleDropdown} title="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 px-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-500 font-medium">{unreadCount} unread</span>
            )}
          </div>
          <div className="mt-1 max-h-64 overflow-y-auto space-y-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`flex flex-col gap-0.5 p-2 rounded-md transition-colors ${
                    !item.isRead 
                      ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${!item.isRead ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
