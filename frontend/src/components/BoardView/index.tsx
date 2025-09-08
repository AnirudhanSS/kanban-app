import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ThemeContext } from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import { useNotification } from '../../contexts/NotificationContext';
import { cardService, Card } from '../../services/cardService';
import { boardService, Column as ColumnType } from '../../services/boardService';
import Column from '../Column';
import Header from '../Header';
import MemberManagementModal from '../MemberManagementModal';
import { 
  Container, 
  BoardHeader, 
  BoardTitle, 
  BoardDescription,
  ColumnsContainer,
  LoadingContainer,
  BackButton
} from './styles';

interface BoardViewProps {
  boardId: string;
  toggleTheme?: () => void;
  onBackToDashboard?: () => void;
}


const BoardView: React.FC<BoardViewProps> = ({ boardId, toggleTheme, onBackToDashboard }) => {
  const { socket, onlineUsers } = useSocket();
  const { showNotification } = useNotification();
  const theme = useContext(ThemeContext);
  
  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer');

  // Event handlers
  const handleCardCreated = useCallback((newCard: Card) => {
    console.log('🎉 Card created event received:', newCard);
    setCards(prev => [...prev, newCard]);
    showNotification(`Card "${newCard.title}" created`, 'success');
  }, [showNotification]);

  const handleCardUpdated = useCallback((updatedData: any) => {
    console.log('🔄 Card updated event received:', updatedData);
    // Handle both Card object and update event data
    if (updatedData.id) {
      // This is a Card object
      setCards(prev => prev.map(card => 
        card.id === updatedData.id ? updatedData : card
      ));
      showNotification(`Card "${updatedData.title}" updated`, 'info');
    } else {
      // This might be an event data structure
      console.log('Received card update event:', updatedData);
    }
  }, [showNotification]);

  const handleCardDeleted = useCallback((deletedCard: { id: string }) => {
    console.log('🗑️ Card deleted event received:', deletedCard);
    setCards(prev => prev.filter(card => card.id !== deletedCard.id));
    showNotification('Card deleted', 'warning');
  }, [showNotification]);

  const handleCardMoved = useCallback((movedData: any) => {
    console.log('📦 Card moved event received:', movedData);
    // Handle both Card object and move event data
    if (movedData.cardId) {
      // This is a move event from WebSocket
      setCards(prev => prev.map(card => 
        card.id === movedData.cardId ? {
          ...card,
          column_id: movedData.newColumnId,
          position: movedData.newPosition
        } : card
      ));
      showNotification(`Card moved`, 'info');
    } else {
      // This is a Card object
      setCards(prev => prev.map(card => 
        card.id === movedData.id ? movedData : card
      ));
      showNotification(`Card "${movedData.title}" moved`, 'info');
    }
  }, [showNotification]);

  // Column event handlers
  const handleColumnCreated = useCallback((newColumn: any) => {
    setColumns(prev => [...prev, newColumn]);
    showNotification(`Column "${newColumn.title}" created`, 'success');
  }, [showNotification]);

  const handleColumnUpdated = useCallback((updatedColumn: any) => {
    setColumns(prev => prev.map(column => 
      column.id === updatedColumn.id ? updatedColumn : column
    ));
    showNotification(`Column "${updatedColumn.title}" updated`, 'info');
  }, [showNotification]);

  const handleColumnDeleted = useCallback((deletedColumn: { id: string }) => {
    setColumns(prev => prev.filter(column => column.id !== deletedColumn.id));
    showNotification('Column deleted', 'warning');
  }, [showNotification]);

  // Member event handlers
  const handleMemberAdded = useCallback((newMember: any) => {
    showNotification('New member added to board', 'success');
    // You might want to refresh member list or update UI
  }, [showNotification]);

  const handleMemberUpdated = useCallback((updatedMember: any) => {
    showNotification('Member role updated', 'info');
    // You might want to refresh member list or update UI
  }, [showNotification]);

  const handleMemberRemoved = useCallback((removedMember: { userId: string }) => {
    showNotification('Member removed from board', 'warning');
    // You might want to refresh member list or update UI
  }, [showNotification]);

  // Load board data function
  const loadBoardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading board data for boardId:', boardId);
      
      // Load board details
      const boardData = await boardService.getBoard(boardId);
      console.log('Board data loaded:', boardData);
      setBoard(boardData);
      
      // Load columns from board data
      if (boardData.Columns) {
        setColumns(boardData.Columns);
      } else {
        // Fallback to empty array if no columns
        setColumns([]);
      }
      
      // Load cards
      const cardsData = await cardService.getCards(boardId);
      setCards(cardsData);
      
      // Get user role from board data
      setCurrentUserRole(boardData.userRole || 'viewer');
      
    } catch (err: any) {
      console.error('Failed to load board data:', err);
      
      // If 403 error, try to join the board
      if (err.response?.status === 403) {
        try {
          console.log('Attempting to join board...');
          await boardService.joinBoard(boardId);
          // Retry loading board data
          const boardData = await boardService.getBoard(boardId);
          setBoard(boardData);
          
          if (boardData.Columns) {
            setColumns(boardData.Columns);
          } else {
            setColumns([]);
          }
          
          const cardsData = await cardService.getCards(boardId);
          setCards(cardsData);
          return; // Success, exit early
        } catch (joinErr: any) {
          console.error('Failed to join board:', joinErr);
          setError('You are not a member of this board and could not join automatically');
        }
      } else {
        setError(err.message || 'Failed to load board');
      }
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) return;

    try {
      // Find the card being moved
      const card = cards.find(c => c.id === draggableId);
      if (!card) return;

      // Calculate position based on destination
      const destinationColumnCards = cards
        .filter(c => c.column_id === destination.droppableId)
        .sort((a, b) => a.position - b.position);
      
      let newPosition = destination.index * 1000; // Simple position calculation
      
      // If moving within the same column, adjust positions of other cards
      if (source.droppableId === destination.droppableId) {
        // Moving within same column - use index-based position
        newPosition = destination.index * 1000;
      } else {
        // Moving to different column - calculate position between existing cards
        if (destination.index === 0) {
          newPosition = destinationColumnCards.length > 0 ? destinationColumnCards[0].position / 2 : 1000;
        } else if (destination.index >= destinationColumnCards.length) {
          newPosition = destinationColumnCards.length > 0 ? destinationColumnCards[destinationColumnCards.length - 1].position + 1000 : 1000;
        } else {
          const prevCard = destinationColumnCards[destination.index - 1];
          const nextCard = destinationColumnCards[destination.index];
          newPosition = (prevCard.position + nextCard.position) / 2;
        }
      }

      // Optimistic update - update local state immediately
      setCards(prev => prev.map(c => 
        c.id === card.id ? { ...c, column_id: destination.droppableId, position: newPosition } : c
      ));

      // Update card position and column on server
      const updatedCard = await cardService.updateCard(card.id, {
        column_id: destination.droppableId,
        position: newPosition
      });

      // Update local state with server response
      setCards(prev => prev.map(c => 
        c.id === card.id ? updatedCard : c
      ));

      // Emit real-time update
      if (socket) {
        socket.emit('cardMoved', {
          cardId: card.id,
          boardId,
          newColumnId: destination.droppableId,
          newPosition: newPosition
        });
      }

    } catch (error) {
      console.error('Failed to move card:', error);
      // Revert the drag operation
      loadBoardData();
    }
  };

  const handleCreateCard = async (cardData: any) => {
    try {
      const newCard = await cardService.createCard({
        ...cardData,
        column_id: cardData.column_id || columns[0]?.id
      });
      
      // Don't add to local state here - let the WebSocket event handle it
      // This prevents duplicate cards
      showNotification(`Card "${newCard.title}" created`, 'success');
      
    } catch (error) {
      console.error('Failed to create card:', error);
      showNotification('Failed to create card', 'error');
    }
  };

  const handleUpdateCard = async (cardId: string, updates: any) => {
    try {
      const updatedCard = await cardService.updateCard(cardId, updates);
      
      // Don't update local state here - let the WebSocket event handle it
      // This prevents conflicts and ensures consistency
      showNotification(`Card "${updatedCard.title}" updated`, 'info');
      
    } catch (error) {
      console.error('Failed to update card:', error);
      showNotification('Failed to update card', 'error');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await cardService.deleteCard(cardId);
      
      // Don't remove from local state here - let the WebSocket event handle it
      // This prevents conflicts and ensures consistency
      showNotification('Card deleted', 'warning');
      
    } catch (error) {
      console.error('Failed to delete card:', error);
      showNotification('Failed to delete card', 'error');
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [boardId, loadBoardData]);

  useEffect(() => {
    if (socket) {
      console.log('🔌 Socket connected, joining board:', boardId);
      // Join board room for real-time updates
      socket.emit('joinBoard', boardId);
      
      // Listen for real-time updates
      socket.on('cardCreated', handleCardCreated);
      socket.on('cardUpdated', handleCardUpdated);
      socket.on('card:updated', handleCardUpdated);
      socket.on('cardDeleted', handleCardDeleted);
      socket.on('cardMoved', handleCardMoved);
      socket.on('card:moved', handleCardMoved);
      
      // Debug: Listen to all events
      socket.onAny((eventName: string, ...args: any[]) => {
        if (eventName.includes('card') || eventName.includes('Card')) {
          console.log(`📡 Received event: ${eventName}`, args);
        }
      });
      
      // Column events
      socket.on('columnCreated', handleColumnCreated);
      socket.on('columnUpdated', handleColumnUpdated);
      socket.on('columnDeleted', handleColumnDeleted);

      // Member events
      socket.on('memberAdded', handleMemberAdded);
      socket.on('memberUpdated', handleMemberUpdated);
      socket.on('memberRemoved', handleMemberRemoved);

      return () => {
        socket.emit('leaveBoard', boardId);
        socket.off('cardCreated', handleCardCreated);
        socket.off('cardUpdated', handleCardUpdated);
        socket.off('card:updated', handleCardUpdated);
        socket.off('cardDeleted', handleCardDeleted);
        socket.off('cardMoved', handleCardMoved);
        socket.off('card:moved', handleCardMoved);

        // Column events
        socket.off('columnCreated', handleColumnCreated);
        socket.off('columnUpdated', handleColumnUpdated);
        socket.off('columnDeleted', handleColumnDeleted);

        // Member events
        socket.off('memberAdded', handleMemberAdded);
        socket.off('memberUpdated', handleMemberUpdated);
        socket.off('memberRemoved', handleMemberRemoved);
      };
    }
  }, [socket, boardId, handleCardCreated, handleCardUpdated, handleCardDeleted, handleCardMoved, handleColumnCreated, handleColumnUpdated, handleColumnDeleted, handleMemberAdded, handleMemberUpdated, handleMemberRemoved]);

  if (isLoading) {
    return (
      <Container>
        <Header toggleTheme={toggleTheme} currentTheme={theme?.title} />
        <LoadingContainer>
          <p>Loading board...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header toggleTheme={toggleTheme} currentTheme={theme?.title} />
        <LoadingContainer>
          <p>Error: {error}</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header toggleTheme={toggleTheme} currentTheme={theme?.title} />
      
      <BoardHeader>
        {onBackToDashboard && (
          <BackButton onClick={onBackToDashboard}>
            ← Back to Dashboard
          </BackButton>
        )}
        <div>
          <BoardTitle>{board?.title}</BoardTitle>
          {board?.description && (
            <BoardDescription>{board.description}</BoardDescription>
          )}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '8px',
            fontSize: '14px',
            color: theme?.colors?.text_secondary || '#666'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50'
            }}></div>
            <span>{onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ 
            color: '#666', 
            fontSize: '0.9rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '20px'
          }}>
            Role: {currentUserRole}
          </span>
          
          
          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <button
              onClick={() => setShowMemberModal(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              👥 Manage Members
            </button>
          )}
        </div>
      </BoardHeader>

      <DragDropContext onDragEnd={onDragEnd}>
        <ColumnsContainer>
          {columns.map(column => {
            const columnCards = cards.filter(card => card.column_id === column.id);
            return (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                cards={columnCards}
                userRole={currentUserRole}
                onCreateCard={handleCreateCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
              />
            );
          })}
        </ColumnsContainer>
      </DragDropContext>

      <MemberManagementModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        boardId={boardId}
        currentUserRole={currentUserRole}
      />
    </Container>
  );
};

export default BoardView;
