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

  useEffect(() => {
    if (socket && user) {
      // Listen for board creation events
      socket.on('boardCreated', handleBoardCreated);
      
      return () => {
        socket.off('boardCreated', handleBoardCreated);
      };
    }
  }, [socket, user, handleBoardCreated]);

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

  const handleBoardUpdated = (updatedBoard: Board) => {
    setBoards(prev => prev.map(board => 
      board.id === updatedBoard.id ? updatedBoard : board
    ));
  };

  const handleBoardDeleted = (boardId: string) => {
    setBoards(prev => prev.filter(board => board.id !== boardId));
    // Recalculate stats
    const remainingBoards = boards.filter(board => board.id !== boardId);
    const myBoards = remainingBoards.filter(board => board.owner_id === user?.id);
    const sharedBoards = remainingBoards.filter(board => board.owner_id !== user?.id);
    setStats({
      totalBoards: remainingBoards.length,
      myBoards: myBoards.length,
      sharedBoards: sharedBoards.length
    });
  };

  const myBoards = boards.filter(board => board.owner_id === user?.id);
  const sharedBoards = boards.filter(board => board.owner_id !== user?.id);

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
        <SectionTitle>My Boards</SectionTitle>
        <BoardsGrid>
          {isLoading ? (
            <p>Loading boards...</p>
          ) : myBoards.length > 0 ? (
            myBoards.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                isOwner={true} 
                onViewBoard={onViewBoard}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeleted}
              />
            ))
          ) : (
            <p>No boards yet. Create your first board!</p>
          )}
        </BoardsGrid>
      </BoardsSection>

      {sharedBoards.length > 0 && (
        <BoardsSection>
          <SectionTitle>Shared Boards</SectionTitle>
          <BoardsGrid>
            {sharedBoards.map(board => (
              <BoardCard 
                key={board.id} 
                board={board} 
                isOwner={false} 
                onViewBoard={onViewBoard}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeleted}
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
