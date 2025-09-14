import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ThemeContext } from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { boardService, Board } from '../../services/boardService';
import Header from '../Header';
import BoardCard from '../BoardCard';
import CreateBoardModal from '../CreateBoardModal';
import JoinBoardModal from '../JoinBoardModal';
import { 
  Container, 
  WelcomeSection, 
  BoardsSection, 
  QuickActions,
  SectionTitle,
  BoardsGrid,
  ActionButton,
  StatsContainer,
  StatCard
} from './styles';

interface DashboardProps {
  toggleTheme?: () => void;
  onViewBoard?: (boardId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleTheme, onViewBoard }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const theme = useContext(ThemeContext);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [stats, setStats] = useState({
    totalBoards: 0,
    myBoards: 0,
    sharedBoards: 0
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBoards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBoards = async () => {
    try {
      setIsLoading(true);
      const userBoards = await boardService.getUserBoards();
      setBoards(userBoards);
      
      // Calculate stats
      const myBoards = userBoards.filter(board => board.owner_id === user?.id);
      const sharedBoards = userBoards.filter(board => board.owner_id !== user?.id);
      
      setStats({
        totalBoards: userBoards.length,
        myBoards: myBoards.length,
        sharedBoards: sharedBoards.length
      });
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = () => {
    setShowCreateModal(true);
  };

  const handleBoardCreated = useCallback((newBoard: Board) => {
    setBoards(prev => [newBoard, ...prev]);
    // Recalculate stats
    const myBoards = [...boards, newBoard].filter(board => board.owner_id === user?.id);
    const sharedBoards = [...boards, newBoard].filter(board => board.owner_id !== user?.id);
    setStats({
      totalBoards: boards.length + 1,
      myBoards: myBoards.length,
      sharedBoards: sharedBoards.length
    });
  }, [boards, user?.id]);

  const handleBoardUpdated = useCallback((updatedBoard: Board) => {
    setBoards(prev => prev.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
  }, []);

  const handleBoardDeleted = useCallback((data: { boardId: string }) => {
    setBoards(prev => prev.filter(board => board.id !== data.boardId));
    // Recalculate stats
    const remainingBoards = boards.filter(board => board.id !== data.boardId);
    const myBoards = remainingBoards.filter(board => board.owner_id === user?.id);
    const sharedBoards = remainingBoards.filter(board => board.owner_id !== user?.id);
    setStats({
      totalBoards: remainingBoards.length,
      myBoards: myBoards.length,
      sharedBoards: sharedBoards.length
    });
  }, [boards, user?.id]);

  // Wrapper function for BoardCard component (expects string, not object)
  const handleBoardDeletedForCard = useCallback((boardId: string) => {
    handleBoardDeleted({ boardId });
  }, [handleBoardDeleted]);

  useEffect(() => {
    if (socket && user) {
      // Listen for board events
      socket.on('boardCreated', handleBoardCreated);
      socket.on('boardUpdated', handleBoardUpdated);
      socket.on('boardDeleted', handleBoardDeleted);
      
      return () => {
        socket.off('boardCreated', handleBoardCreated);
        socket.off('boardUpdated', handleBoardUpdated);
        socket.off('boardDeleted', handleBoardDeleted);
      };
    }
  }, [socket, user, handleBoardCreated, handleBoardUpdated, handleBoardDeleted]);

  const handleJoinBoard = () => {
    setShowJoinModal(true);
  };

  const handleBoardJoined = (newBoard: Board) => {
    setBoards(prev => [newBoard, ...prev]);
    // Recalculate stats
    const myBoards = [...boards, newBoard].filter(board => board.owner_id === user?.id);
    const sharedBoards = [...boards, newBoard].filter(board => board.owner_id !== user?.id);
    setStats({
      totalBoards: boards.length + 1,
      myBoards: myBoards.length,
      sharedBoards: sharedBoards.length
    });
  };


  // Filter boards based on search query
  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const myBoards = filteredBoards.filter(board => board.owner_id === user?.id);
  const sharedBoards = filteredBoards.filter(board => board.owner_id !== user?.id);

  return (
    <Container>
      <Header toggleTheme={toggleTheme} currentTheme={theme?.title} />
      
      <WelcomeSection>
        <h1>Welcome back, {user?.first_name}!</h1>
        <p>Manage your boards and collaborate with your team</p>
      </WelcomeSection>

      <StatsContainer>
        <StatCard>
          <h3>{stats.totalBoards}</h3>
          <p>Total Boards</p>
        </StatCard>
        <StatCard>
          <h3>{stats.myBoards}</h3>
          <p>My Boards</p>
        </StatCard>
        <StatCard>
          <h3>{stats.sharedBoards}</h3>
          <p>Shared Boards</p>
        </StatCard>
      </StatsContainer>

      {/* Search Box */}
      <div style={{ 
        margin: '2rem 0', 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          position: 'relative',
          width: '100%',
          maxWidth: '500px'
        }}>
          <input
            type="text"
            placeholder="Search boards by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              backgroundColor: theme?.colors?.background || '#ffffff',
              color: theme?.colors?.text || '#333333'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#EB622F';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
            }}
          />
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#999',
            fontSize: '1.1rem'
          }}>
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <QuickActions>
        <ActionButton onClick={handleCreateBoard}>
          + Create New Board
        </ActionButton>
        <ActionButton onClick={handleJoinBoard}>
          Join Board
        </ActionButton>
        {/* <ActionButton>
          Import Board
        </ActionButton>
        <ActionButton>
          Templates
        </ActionButton> */}
      </QuickActions>

      <BoardsSection>
        <SectionTitle>
          My Boards
          {searchQuery && (
            <span style={{ 
              fontSize: '0.9rem', 
              fontWeight: 'normal', 
              color: '#666',
              marginLeft: '0.5rem'
            }}>
              ({myBoards.length} found)
            </span>
          )}
        </SectionTitle>
        <BoardsGrid>
          {isLoading ? (
            <p>Loading boards...</p>
          ) : myBoards.length > 0 ? (
            myBoards.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                isOwner={true} 
                userRole={board.userRole}
                onViewBoard={onViewBoard}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeletedForCard}
              />
            ))
          ) : searchQuery ? (
            <p>No boards found matching "{searchQuery}"</p>
          ) : (
            <p>No boards yet. Create your first board!</p>
          )}
        </BoardsGrid>
      </BoardsSection>

      {sharedBoards.length > 0 && (
        <BoardsSection>
          <SectionTitle>
            Shared Boards
            {searchQuery && (
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'normal', 
                color: '#666',
                marginLeft: '0.5rem'
              }}>
                ({sharedBoards.length} found)
              </span>
            )}
          </SectionTitle>
          <BoardsGrid>
            {sharedBoards.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                isOwner={false} 
                userRole={board.userRole}
                onViewBoard={onViewBoard}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeletedForCard}
              />
            ))}
          </BoardsGrid>
        </BoardsSection>
      )}

      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBoardCreated={handleBoardCreated}
      />

      <JoinBoardModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onBoardJoined={handleBoardJoined}
      />
    </Container>
  );
};

export default Dashboard;
