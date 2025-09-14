import React, { useState } from 'react';
import { boardService, CreateBoardData } from '../../services/boardService';
import { columnService } from '../../services/columnService';
import { cardService } from '../../services/cardService';
import { BoardTemplate } from '../../services/boardTemplateService';
import { useNotification } from '../../contexts/NotificationContext';
import BoardTemplateSelector from '../BoardTemplateSelector';
import { Container, Content, CloseButton, Title, Form, Input, MultilineInput, Button, ButtonGroup, ColorPicker, ColorOption, ToggleContainer, ToggleLabel, ToggleSwitch, TemplateSection } from './styles';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (board: any) => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onBoardCreated }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<CreateBoardData>({
    title: '',
    description: '',
    background_color: '#EB622F',
    is_public: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const colors = [
    '#EB622F', '#4CAF50', '#2196F3', '#9C27B0', 
    '#FF9800', '#F44336', '#00BCD4', '#795548'
  ];

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

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.description
    }));
    setShowTemplates(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      const newBoard = await boardService.createBoard({
        ...formData,
        title: formData.title.trim(),
        skip_default_columns: !!selectedTemplate // Skip default columns if using a template
      });
      
      // If a template is selected, create columns and cards
      if (selectedTemplate) {
        // Create columns
        for (const column of selectedTemplate.columns) {
          await columnService.createColumn(newBoard.id, {
            title: column.title,
            position: column.position
          });
        }

        // Create cards if any
        if (selectedTemplate.cards && selectedTemplate.cards.length > 0) {
          // Get the created columns to map cards to them
          const boardData = await boardService.getBoard(newBoard.id);
          const columns = boardData.Columns || [];

          for (const card of selectedTemplate.cards) {
            const column = columns.find((col: any) => col.title === card.columnTitle);
            if (column) {
              await cardService.createCard({
                title: card.title,
                description: card.description,
                column_id: column.id,
                priority: card.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined
              });
            }
          }
        }
      }
      
      onBoardCreated(newBoard);
      showNotification('Board created successfully', 'success');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        background_color: '#EB622F',
        is_public: false
      });
      setSelectedTemplate(null);
    } catch (err: any) {
      console.error('Failed to create board:', err);
      showNotification('Failed to create board', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setFormData({
        title: '',
        description: '',
        background_color: '#EB622F',
        is_public: false
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Container onClick={handleClose}>
      <Content onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>
        <Title>Create New Board</Title>
        
        <Form onSubmit={handleSubmit}>
          <TemplateSection>
            <Button 
              type="button" 
              onClick={() => setShowTemplates(!showTemplates)}
              $secondary
            >
              {selectedTemplate ? `Template: ${selectedTemplate.name}` : 'Choose Template (Optional)'}
            </Button>
            
            {showTemplates && (
              <BoardTemplateSelector
                onSelectTemplate={handleTemplateSelect}
              />
            )}
          </TemplateSection>

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
            <Button type="button" onClick={handleClose} $secondary>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? 'Creating...' : 'Create Board'}
            </Button>
          </ButtonGroup>
        </Form>
      </Content>
    </Container>
  );
};

export default CreateBoardModal;
