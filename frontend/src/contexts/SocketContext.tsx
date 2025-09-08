import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socketService: typeof socketService;
  socket: any;
  joinBoard: (boardId: string) => void;
  leaveBoard: (boardId: string) => void;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [onlineUsers, setOnlineUsers] = React.useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        socketService.connect(token);

        // Set up event listeners
        socketService.onPresenceUpdate((users) => {
          setOnlineUsers(users);
        });

        socketService.onNotification((notification) => {
          // You can add a toast notification here
          console.log('Notification:', notification);
        });

        socketService.onMentionAdded((mention) => {
          // You can add a mention notification here
          console.log('Mention:', mention);
        });
      }
    } else {
      socketService.disconnect();
      setOnlineUsers([]);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  const joinBoard = (boardId: string) => {
    socketService.joinBoard(boardId);
  };

  const leaveBoard = (boardId: string) => {
    socketService.leaveBoard(boardId);
  };

  const value = {
    socketService,
    socket: socketService.getSocket(),
    joinBoard,
    leaveBoard,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
