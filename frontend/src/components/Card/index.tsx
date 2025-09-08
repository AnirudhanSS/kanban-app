import React, { useContext, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ThemeContext } from 'styled-components';
import { Card as CardType } from '../../services/cardService';
import Modal from '../Modal';
import { CardBorder, CardBottom, CardContainer, CardTitle, CardDescription, CardActions, ActionButton } from './styles';

interface CardProps {
  card: CardType;
  index: number;
  userRole?: string;
  onUpdate?: (cardId: string, updates: any) => void;
  onDelete?: (cardId: string) => void;
}

const Card: React.FC<CardProps> = ({ card, index, userRole = 'viewer', onUpdate, onDelete }) => {
  const theme = useContext(ThemeContext)!; 
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this card?')) {
      setIsDeleting(true);
      try {
        await onDelete(card.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdate = async (updates: any) => {
    if (onUpdate) {
      setIsUpdating(true);
      try {
        await onUpdate(card.id, updates);
        setShowEditModal(false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return null;
    }
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <CardContainer
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            $isDragging={snapshot.isDragging}
          >
            <CardBorder $color={theme.colors.primary} />
            <CardBottom>
              <CardTitle>{card.title}</CardTitle>
              {card.description && (
                <CardDescription>{card.description}</CardDescription>
              )}
              
              <CardActions>
                {card.due_date && (
                  <span>Due: {formatDate(card.due_date)}</span>
                )}
                {card.priority && (
                  <span>Priority: {card.priority}</span>
                )}
                {(userRole === 'editor' || userRole === 'admin' || userRole === 'owner') && (
                  <div>
                    <ActionButton onClick={handleEdit} disabled={isUpdating || isDeleting}>
                      {isUpdating ? 'Updating...' : 'Edit'}
                    </ActionButton>
                    {(userRole === 'admin' || userRole === 'owner') && (
                      <ActionButton onClick={handleDelete} $danger disabled={isUpdating || isDeleting}>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </ActionButton>
                    )}
                  </div>
                )}
              </CardActions>
            </CardBottom>
          </CardContainer>
        )}
      </Draggable>

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
          title="Edit Card"
          initialData={{
            title: card.title,
            description: card.description,
            due_date: card.due_date,
            priority: card.priority
          }}
        />
      )}
    </>
  );
};

export default Card;