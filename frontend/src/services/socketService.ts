import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io(process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : ''), {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    if (this.socket) {
      this.socket.emit('joinBoard', boardId);
    }
  }

  leaveBoard(boardId: string) {
    if (this.socket) {
      this.socket.emit('leaveBoard', boardId);
    }
  }

  updateCard(data: any) {
    if (this.socket) {
      this.socket.emit('updateCard', data);
    }
  }

  addComment(data: any) {
    if (this.socket) {
      this.socket.emit('addComment', data);
    }
  }

  onCardUpdated(callback: (card: any) => void) {
    if (this.socket) {
      this.socket.on('card:updated', callback);
      this.socket.on('cardUpdated', callback);
    }
  }

  onCardCreated(callback: (card: any) => void) {
    if (this.socket) {
      this.socket.on('cardCreated', callback);
    }
  }

  onCardDeleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('cardDeleted', callback);
    }
  }

  onCardMoved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('card:moved', callback);
      this.socket.on('cardMoved', callback);
    }
  }

  // Column events
  onColumnCreated(callback: (column: any) => void) {
    if (this.socket) {
      this.socket.on('columnCreated', callback);
    }
  }

  onColumnUpdated(callback: (column: any) => void) {
    if (this.socket) {
      this.socket.on('columnUpdated', callback);
    }
  }

  onColumnDeleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('columnDeleted', callback);
    }
  }

  // Member events
  onMemberAdded(callback: (member: any) => void) {
    if (this.socket) {
      this.socket.on('memberAdded', callback);
    }
  }

  onMemberUpdated(callback: (member: any) => void) {
    if (this.socket) {
      this.socket.on('memberUpdated', callback);
    }
  }

  onMemberRemoved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('memberRemoved', callback);
    }
  }

  onCommentAdded(callback: (comment: any) => void) {
    if (this.socket) {
      this.socket.on('comment:added', callback);
    }
  }

  onPresenceUpdate(callback: (users: string[]) => void) {
    if (this.socket) {
      this.socket.on('presence:update', callback);
    }
  }

  onMentionAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('mention:added', callback);
    }
  }

  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
