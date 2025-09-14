import React, { useState } from 'react';
import { Board } from '../../services/boardService';
import { useNotification } from '../../contexts/NotificationContext';
import EditBoardModal from '../EditBoardModal';
import { 
  CardContainer, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter, 
  CardActions, 
  ActionButton, 
  OwnerBadge, 
  PublicBadge 
} from './styles';

interface BoardCardProps {
  board: Board;
  isOwner?: boolean;
  userRole?: string;
  onViewBoard?: (boardId: string) => void;
  onBoardUpdated?: (updatedBoard: Board) => void;
  onBoardDeleted?: (boardId: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ 
  board, 
  isOwner, 
  userRole,
  onViewBoard, 
  onBoardUpdated, 
  onBoardDeleted 
}) => {
  const { showNotification } = useNotification();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleOpenBoard = () => {
    if (onViewBoard) {
      onViewBoard(board.id);
    } else {
      console.log('Open board:', board.id);
    }
  };

  const handleEditBoard = () => {
    setShowEditModal(true);
  };

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        // Import boardService dynamically to avoid circular dependency
        const { boardService } = await import('../../services/boardService');
        await boardService.deleteBoard(board.id);
        showNotification('Board deleted successfully', 'success');
        if (onBoardDeleted) {
          onBoardDeleted(board.id);
        }
      } catch (error) {
        console.error('Failed to delete board:', error);
        showNotification('Failed to delete board', 'error');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleBoardUpdated = (updatedBoard: Board) => {
    if (onBoardUpdated) {
      onBoardUpdated(updatedBoard);
    }
    setShowEditModal(false);
  };

  const handleCopyBoardId = () => {
    navigator.clipboard.writeText(board.id).then(() => {
      showNotification('Board ID copied to clipboard', 'success');
    }).catch(err => {
      console.error('Failed to copy board ID:', err);
      showNotification('Failed to copy board ID', 'error');
    });
  };

  const formatDate = (board: Board) => {
    try {
      // Try camelCase first (from API), then snake_case
      const dateString = board.updatedAt || board.updated_at;
      if (!dateString) return 'Recently';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const baseStyle = {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      color: 'white'
    };

    switch (role) {
      case 'admin':
        return { ...baseStyle, backgroundColor: '#ff9800' };
      case 'editor':
        return { ...baseStyle, backgroundColor: '#2196f3' };
      case 'viewer':
        return { ...baseStyle, backgroundColor: '#9e9e9e' };
      default:
        return { ...baseStyle, backgroundColor: '#9e9e9e' };
    }
  };

  return (
    <>
    <CardContainer>
      <CardHeader>
        <CardTitle>{board.title}</CardTitle>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isOwner && <OwnerBadge>Owner</OwnerBadge>}
          {!isOwner && userRole && (
            <span style={getRoleBadgeStyle(userRole)}>
              {userRole}
            </span>
          )}
          {board.is_public && <PublicBadge>Public</PublicBadge>}
        </div>
      </CardHeader>
      
      {board.description && (
        <CardDescription>{board.description}</CardDescription>
      )}
      
      <CardFooter>
        <div>
          <small>Updated: {formatDate(board)}</small>
        </div>
        
        <CardActions>
          <ActionButton onClick={handleOpenBoard} $primary>
            Open
          </ActionButton>
          
          <ActionButton onClick={handleCopyBoardId} title="Copy Board ID">
            📋 Copy ID
          </ActionButton>
          
          {isOwner && (
            <>
              <ActionButton onClick={handleEditBoard}>
                Edit
              </ActionButton>
              <ActionButton onClick={handleDeleteBoard} $danger disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ActionButton>
            </>
          )}
        </CardActions>
      </CardFooter>
    </CardContainer>

    {showEditModal && (
      <EditBoardModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        board={board}
        onBoardUpdated={handleBoardUpdated}
      />
    )}
  </>
  );
};

export default BoardCard;
