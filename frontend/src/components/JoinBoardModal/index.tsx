import React, { useState } from 'react';
import { boardService } from '../../services/boardService';
import { Container, ModalContent, Input, Button, CloseButton } from './styles';
import closeIcon from '../../assets/close.png';

interface JoinBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardJoined: (board: any) => void;
}

const JoinBoardModal: React.FC<JoinBoardModalProps> = ({ isOpen, onClose, onBoardJoined }) => {
  const [boardId, setBoardId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boardId.trim()) {
      setError('Board ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await boardService.joinBoard(boardId.trim());
      
      // Check if user was already a member
      if (result.alreadyMember || result.message === 'Already a member') {
        // User is already a member, just close the modal
        onClose();
        setBoardId('');
        return;
      }
      
      // If successful join, get the board details
      const board = await boardService.getBoard(boardId.trim());
      
      onBoardJoined(board);
      onClose();
      
      // Reset form
      setBoardId('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to join board');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError(null);
      setBoardId('');
    }
  };

  if (!isOpen) return null;

  return (
    <Container onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <img src={closeIcon} alt="Close" />
        </CloseButton>
        
        <h2>Join a Board</h2>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter the Board ID to join an existing board. You'll be added as a viewer.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="boardId">Board ID</label>
            <Input
              type="text"
              id="boardId"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter board ID (e.g., e2bcfbc4-0ee2-4cd6-9c7c-b90749b71e2e)"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div style={{ 
              color: '#DB4B4B', 
              padding: '0.5rem 0', 
              fontSize: '0.9rem',
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Board'}
          </Button>
        </form>
      </ModalContent>
    </Container>
  );
};

export default JoinBoardModal;
