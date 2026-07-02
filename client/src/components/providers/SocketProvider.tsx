import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
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

    // Connect Main Socket
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
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
      toast.error('Chat connection failed. Please refresh and sign in again.');
    });

    newSocket.on('connect', () => {
      console.log('Socket connected with auth token');
    });

    setSocket(newSocket);

    // Connect Admin Namespace if user is Admin
    // In a real app we'd check exactly, but here we just connect if they are admin role
    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      const newAdminSocket = io(`${socketUrl}/admin`, {
        auth: { token },
        reconnection: true,
        transports: ['websocket', 'polling'],
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
