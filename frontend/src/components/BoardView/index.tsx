import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DragDropContext, DropResult, Droppable } from '@hello-pangea/dnd';
import { ThemeContext } from 'styled-components';
import { useSocket } from '../../contexts/SocketContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { cardService, Card } from '../../services/cardService';
import { boardService, Column as ColumnType } from '../../services/boardService';
import { columnService } from '../../services/columnService';
import { canManageMembers, UserRole } from '../../utils/permissions';
import Column from '../Column';
import Header from '../Header';
import MemberManagementModal from '../MemberManagementModal';
import BoardAdminPanel from '../BoardAdminPanel';
import ColumnManagement from '../ColumnManagement';
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
  const { user } = useAuth();
  const theme = useContext(ThemeContext);
  
  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showColumnManagement, setShowColumnManagement] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer');
  
  // Visual feedback state
  const [editingCards, setEditingCards] = useState<Map<string, { userId: string; userName: string; field?: string }>>(new Map());
  const [movingCards, setMovingCards] = useState<Map<string, { userId: string; userName: string }>>(new Map());

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
      // This is a Card object - only show notification if it's not a move operation
      setCards(prev => prev.map(card => 
        card.id === updatedData.id ? updatedData : card
      ));
      
      // Only show "updated" notification if it's not a position change (move operation)
      // Move operations will be handled by handleCardMoved to avoid duplicate notifications
      if (updatedData.position === undefined) {
        showNotification(`Card "${updatedData.title}" updated`, 'info');
      }
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
      setCards(prev => {
        const currentCard = prev.find(card => card.id === movedData.cardId);
        if (!currentCard) return prev;
        
        // Check if the card is already in the correct position
        const isAlreadyCorrect = currentCard.column_id === movedData.newColumnId && 
                                currentCard.position === movedData.newPosition;
        
        if (isAlreadyCorrect) {
          console.log('📦 Card already in correct position, skipping update');
          return prev; // No change needed - prevents flicker!
        }
        
        console.log('📦 Applying card move from server');
        return prev.map(card => {
          if (card.id === movedData.cardId) {
            return {
              ...card,
              column_id: movedData.newColumnId,
              position: movedData.newPosition
            };
          }
          return card;
        });
      });
      // Find the card title for the notification
      const movedCard = cards.find(card => card.id === movedData.cardId);
      const cardTitle = movedCard ? movedCard.title : 'Card';
      showNotification(`"${cardTitle}" moved`, 'info');
    } else {
      // This is a Card object
      setCards(prev => {
        const currentCard = prev.find(card => card.id === movedData.id);
        if (!currentCard) return prev;
        
        // Check if the card is already in the correct state
        const isAlreadyCorrect = currentCard.column_id === movedData.column_id && 
                                currentCard.position === movedData.position;
        
        if (isAlreadyCorrect) {
          console.log('📦 Card already in correct state, skipping update');
          return prev; // No change needed - prevents flicker!
        }
        
        console.log('📦 Applying card update from server');
        return prev.map(card => 
          card.id === movedData.id ? movedData : card
        );
      });
      showNotification(`"${movedData.title}" moved`, 'info');
    }
  }, [showNotification, cards]);

  // Column event handlers
  const handleColumnCreated = useCallback((newColumn: any) => {
    setColumns(prev => [...prev, newColumn]);
    showNotification(`Column "${newColumn.title}" created`, 'success');
  }, [showNotification]);

  const handleColumnUpdated = useCallback((updatedColumn: any) => {
    console.log('📋 Column updated WebSocket event received:', updatedColumn);
    setColumns(prev => prev.map(column => 
      column.id === updatedColumn.id ? updatedColumn : column
    ));
    showNotification(`Column "${updatedColumn.title}" updated`, 'info');
  }, [showNotification]);

  const handleColumnDeleted = useCallback((deletedColumn: { id: string }) => {
    setColumns(prev => prev.filter(column => column.id !== deletedColumn.id));
    showNotification('Column deleted', 'warning');
  }, [showNotification]);

  const handleColumnsReordered = useCallback((data: { columnIds: string[] }) => {
    console.log('🔄 Columns reordered:', data.columnIds);
    // Only update if the order is actually different from current state
    setColumns(prev => {
      const currentOrder = prev.map(col => col.id);
      const isSameOrder = currentOrder.length === data.columnIds.length && 
                         currentOrder.every((id, index) => id === data.columnIds[index]);
      
      if (isSameOrder) {
        console.log('🔄 Column order unchanged, skipping update');
        return prev; // No change needed
      }
      
      // Reorder columns based on the new order from server
      const newOrder: any[] = [];
      data.columnIds.forEach(id => {
        const column = prev.find(col => col.id === id);
        if (column) {
          newOrder.push(column);
        }
      });
      console.log('🔄 Applying new column order from WebSocket:', newOrder.map(col => col.title));
      return newOrder;
    });
  }, []);

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

  // Board event handlers
  const handleBoardUpdated = useCallback((updatedBoard: any) => {
    console.log('📋 Board updated event received:', updatedBoard);
    setBoard((prev: any) => prev ? { ...prev, ...updatedBoard } : updatedBoard);
    showNotification('Board updated', 'info');
  }, [showNotification]);

  const handleBoardDeleted = useCallback((data: { boardId: string }) => {
    console.log('🗑️ Board deleted event received:', data);
    showNotification('Board has been deleted', 'warning');
    // Redirect to dashboard or handle board deletion
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  }, [showNotification, onBackToDashboard]);

  // Visual feedback event handlers
  const handleCardEditStart = useCallback((data: { cardId: string; userId: string; userName: string; field?: string }) => {
    console.log('✏️ Card edit started:', data);
    setEditingCards(prev => {
      const newMap = new Map(prev);
      newMap.set(data.cardId, {
        userId: data.userId,
        userName: data.userName,
        field: data.field
      });
      return newMap;
    });
  }, []);

  const handleCardEditEnd = useCallback((data: { cardId: string; userId: string }) => {
    console.log('✅ Card edit ended:', data);
    setEditingCards(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.cardId);
      return newMap;
    });
  }, []);

  const handleCardMoveStart = useCallback((data: { cardId: string; userId: string; userName: string }) => {
    console.log('🔄 Card move started:', data);
    setMovingCards(prev => {
      const newMap = new Map(prev);
      newMap.set(data.cardId, {
        userId: data.userId,
        userName: data.userName
      });
      return newMap;
    });
  }, []);

  const handleCardMoveEnd = useCallback((data: { cardId: string; userId: string }) => {
    console.log('✅ Card move ended:', data);
    setMovingCards(prev => {
      const newMap = new Map(prev);
      newMap.delete(data.cardId);
      return newMap;
    });
  }, []);

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
    const { destination, source, draggableId, type } = result;

    console.log('🔄 Drag end result:', {
      source: { droppableId: source.droppableId, index: source.index },
      destination: destination ? { droppableId: destination.droppableId, index: destination.index } : null,
      draggableId
    });

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) return;

    // Handle column reordering
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columns);
      const [reorderedColumn] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, reorderedColumn);
      
      // Optimistic update - update local state immediately
      setColumns(newColumnOrder);
      
      const columnIds = newColumnOrder.map(col => col.id);
      await handleReorderColumns(columnIds);
      return;
    }

    // Find the card being moved
    const card = cards.find(c => c.id === draggableId);
    if (!card) return;

    // SIMPLE APPROACH: Use timestamp for position - never conflicts!
    const newPosition = Date.now();

    try {
      // Debug logging
      console.log('🎯 Timestamp position calculation:', {
        sourceColumn: source.droppableId,
        destinationColumn: destination.droppableId,
        destinationIndex: destination.index,
        calculatedPosition: newPosition,
        positioning: 'timestamp-based (no conflicts)'
      });

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

    } catch (error: any) {
      // Silent error handling - no console errors or notifications
      console.log('Card move handled silently');
      
      // Handle specific error types silently
      if (error.response?.status === 409) {
        // Position conflict - try to refresh silently
        try {
          const cardsData = await cardService.getCards(boardId);
          setCards(cardsData);
        } catch (refreshError) {
          // Even refresh failed - just continue silently
        }
      } else {
        // Other errors - just refresh silently
        try {
          const cardsData = await cardService.getCards(boardId);
          setCards(cardsData);
        } catch (refreshError) {
          // Even refresh failed - just continue silently
        }
      }
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

  const handleReorderColumns = async (columnIds: string[]) => {
    try {
      await columnService.reorderColumns(columnIds);
      showNotification('Columns reordered successfully', 'success');
    } catch (error) {
      console.error('Failed to reorder columns:', error);
      showNotification('Failed to reorder columns', 'error');
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
        if (eventName.includes('card') || eventName.includes('Card') || eventName.includes('column')) {
          console.log(`📡 Received event: ${eventName}`, args);
        }
      });
      
      // Column events
      socket.on('columnCreated', handleColumnCreated);
      socket.on('columnUpdated', handleColumnUpdated);
      socket.on('columnDeleted', handleColumnDeleted);
      socket.on('columnsReordered', handleColumnsReordered);

      // Member events
      socket.on('memberAdded', handleMemberAdded);
      socket.on('memberUpdated', handleMemberUpdated);
      socket.on('memberRemoved', handleMemberRemoved);

      // Board events
      socket.on('boardUpdated', handleBoardUpdated);
      socket.on('boardDeleted', handleBoardDeleted);

      // Visual feedback events
      socket.on('card:edit_start', handleCardEditStart);
      socket.on('card:edit_end', handleCardEditEnd);
      socket.on('card:move_start', handleCardMoveStart);
      socket.on('card:move_end', handleCardMoveEnd);

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
        socket.off('columnsReordered', handleColumnsReordered);

        // Member events
        socket.off('memberAdded', handleMemberAdded);
        socket.off('memberUpdated', handleMemberUpdated);
        socket.off('memberRemoved', handleMemberRemoved);

        // Board events
        socket.off('boardUpdated', handleBoardUpdated);
        socket.off('boardDeleted', handleBoardDeleted);

        // Visual feedback events
        socket.off('card:edit_start', handleCardEditStart);
        socket.off('card:edit_end', handleCardEditEnd);
        socket.off('card:move_start', handleCardMoveStart);
        socket.off('card:move_end', handleCardMoveEnd);
      };
    }
  }, [socket, boardId]); // eslint-disable-line react-hooks/exhaustive-deps

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
          
          
          {canManageMembers(currentUserRole as UserRole) && (
            <>
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
              <button
                onClick={() => setShowAdminPanel(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#EB622F',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ⚙️ Admin Panel
              </button>
              <button
                onClick={() => setShowColumnManagement(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                📋 Manage Columns
              </button>
            </>
          )}
        </div>
      </BoardHeader>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <ColumnsContainer ref={provided.innerRef} {...provided.droppableProps}>
              {columns.map((column, index) => {
                const columnCards = cards.filter(card => card.column_id === column.id);
                return (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    cards={columnCards}
                    userRole={currentUserRole as UserRole}
                    onCreateCard={handleCreateCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                    editingCards={editingCards}
                    movingCards={movingCards}
                    currentUserId={user?.id}
                    boardId={boardId}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </ColumnsContainer>
          )}
        </Droppable>
      </DragDropContext>

      <MemberManagementModal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        boardId={boardId}
        currentUserRole={currentUserRole}
      />

      {showAdminPanel && (
        <BoardAdminPanel
          boardId={boardId}
          boardName={board?.title || 'Board'}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      <ColumnManagement
        isOpen={showColumnManagement}
        onClose={() => setShowColumnManagement(false)}
        boardId={boardId}
        columns={columns}
        userRole={currentUserRole as UserRole}
        onColumnsUpdated={setColumns}
      />
    </Container>
  );
};

export default BoardView;
