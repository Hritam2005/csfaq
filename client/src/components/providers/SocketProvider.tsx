import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  adminSocket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  adminSocket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [adminSocket, setAdminSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      if (adminSocket) {
        adminSocket.disconnect();
        setAdminSocket(null);
      }
      setIsConnected(false);
      return;
    }

    // Connect Main Socket directly to Node Backend
    const newSocket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to WebSocket');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from WebSocket');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      toast.error(`Socket connection error: ${error.message}`);
    });

    newSocket.on('user_removed', (payload: any) => {
      alert(payload.message || 'You have been excused from the internship.');
      dispatch(logout());
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      window.location.href = '/';
    });

    setSocket(newSocket);

    // Connect Admin Namespace if user is Admin
    // In a real app we'd check exactly, but here we just connect if they are admin role
    if (user?.role?.toLowerCase().includes('admin')) {
      const newAdminSocket = io('http://localhost:5000/admin', {
        auth: { token },
        reconnection: true,
      });
      
      newAdminSocket.on('system_alert', (payload) => {
        if (payload.priority === 'high' || payload.priority === 'critical') {
          toast.error(`System Alert: ${payload.title}`);
        } else {
          toast.success(payload.title);
        }
      });

      setAdminSocket(newAdminSocket);
    }

    return () => {
      newSocket.disconnect();
      if (adminSocket) adminSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // don't add adminSocket to dependency to avoid infinite loops

  return (
    <SocketContext.Provider value={{ socket, adminSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
