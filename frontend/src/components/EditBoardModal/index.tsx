import React, { useState, useEffect } from 'react';
import { boardService, Board } from '../../services/boardService';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, Content, CloseButton, Title, Form, Input, MultilineInput, Button, ButtonGroup, ColorPicker, ColorOption, ToggleContainer, ToggleLabel, ToggleSwitch } from './styles';

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  onBoardUpdated: (updatedBoard: Board) => void;
}

const EditBoardModal: React.FC<EditBoardModalProps> = ({ isOpen, onClose, board, onBoardUpdated }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    background_color: '#EB622F',
    is_public: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#EB622F', '#4CAF50', '#2196F3', '#9C27B0', 
    '#FF9800', '#F44336', '#00BCD4', '#795548'
  ];

  useEffect(() => {
    if (isOpen && board) {
      setFormData({
        title: board.title,
        description: board.description || '',
        background_color: board.background_color || '#EB622F',
        is_public: board.is_public
      });
    }
  }, [isOpen, board]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      const updatedBoard = await boardService.updateBoard(board.id, formData);
      onBoardUpdated(updatedBoard);
      showNotification('Board updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to update board:', error);
      showNotification('Failed to update board', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, background_color: color }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, is_public: e.target.checked }));
  };

  if (!isOpen) return null;

  return (
    <Container onClick={onClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>Edit Board</Title>
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="title"
            placeholder="Board Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          
          <MultilineInput
            name="description"
            placeholder="Board Description (optional)"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />

          <div>
            <label>Background Color:</label>
            <ColorPicker>
              {colors.map(color => (
                <ColorOption
                  key={color}
                  $color={color}
                  $selected={formData.background_color === color}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </ColorPicker>
          </div>

          <ToggleContainer>
            <ToggleLabel>Public Board</ToggleLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={handleToggleChange}
              />
              <span></span>
            </ToggleSwitch>
          </ToggleContainer>

          <ButtonGroup>
            <Button type="button" onClick={onClose} $secondary>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? 'Updating...' : 'Update Board'}
            </Button>
          </ButtonGroup>
        </Form>
      </Content>
    </Container>
  );
};

export default EditBoardModal;
