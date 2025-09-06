import React, { useContext, useState, useEffect, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ThemeContext } from 'styled-components';
import { Card as CardType } from '../../services/cardService';
import { socketService } from '../../services/socketService';
import Modal from '../Modal';
import { CardBorder, CardBottom, CardContainer, CardTitle, CardDescription, CardActions, ActionButton, UserIndicator, StatusIndicator } from './styles';
import Labels from '../Labels';

interface CardProps {
  card: CardType;
  index: number;
  userRole?: string;
  onUpdate?: (cardId: string, updates: any) => void;
  onDelete?: (cardId: string) => void;
  // Visual feedback props
  isBeingEdited?: boolean;
  isBeingMoved?: boolean;
  editingUser?: string;
  movingUser?: string;
  currentUserId?: string;
  boardId?: string;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  index, 
  userRole = 'viewer', 
  onUpdate, 
  onDelete,
  isBeingEdited = false,
  isBeingMoved = false,
  editingUser,
  movingUser,
  currentUserId,
  boardId
}) => {
  const theme = useContext(ThemeContext)!; 
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Emit edit end event when modal is closed
  useEffect(() => {
    if (!showEditModal && boardId) {
      socketService.endCardEdit(card.id, boardId);
    }
  }, [showEditModal, card.id, boardId]);

  // Track drag state for move events
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ isDragging: false, hasEmittedStart: false, hasEmittedEnd: false });

  // Emit move start/end events based on drag state
  useEffect(() => {
    if (isDragging && boardId && !dragStateRef.current.hasEmittedStart) {
      socketService.startCardMove(card.id, boardId);
      dragStateRef.current.hasEmittedStart = true;
      dragStateRef.current.hasEmittedEnd = false;
    } else if (!isDragging && boardId && dragStateRef.current.hasEmittedStart) {
      // Always emit end event when drag stops, regardless of hasEmittedEnd flag
      socketService.endCardMove(card.id, boardId);
      dragStateRef.current.hasEmittedEnd = true;
      dragStateRef.current.hasEmittedStart = false;
    }
  }, [isDragging, card.id, boardId]);

  // Reset drag state when component unmounts or card changes
  useEffect(() => {
    return () => {
      // Clean up any pending move events
      if (dragStateRef.current.hasEmittedStart && boardId) {
        socketService.endCardMove(card.id, boardId);
      }
    };
  }, [card.id, boardId]);

  // Check if card is locked by another user
  const isLockedByOther = Boolean(
    (isBeingEdited && editingUser && editingUser !== currentUserId) || 
    (isBeingMoved && movingUser && movingUser !== currentUserId)
  );

  const handleEdit = () => {
    // Don't allow editing if locked by another user
    if (isLockedByOther) {
      return;
    }
    
    // Emit edit start event
    if (boardId) {
      socketService.startCardEdit(card.id, boardId, 'general');
    }
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    // Don't allow deletion if locked by another user
    if (isLockedByOther) {
      return;
    }
    
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
      <Draggable 
        draggableId={card.id} 
        index={index}
        isDragDisabled={isLockedByOther}
      >
        {(provided, snapshot) => {
          // Update drag state only when it actually changes
          if (snapshot.isDragging !== dragStateRef.current.isDragging) {
            dragStateRef.current.isDragging = snapshot.isDragging;
            // Use requestAnimationFrame to defer state update to avoid render loop
            requestAnimationFrame(() => {
              setIsDragging(snapshot.isDragging);
            });
          }

          // Handle drag end detection for cancelled drags
          if (!snapshot.isDragging && dragStateRef.current.hasEmittedStart && !dragStateRef.current.hasEmittedEnd) {
            // This handles the case where drag was cancelled (not dropped)
            requestAnimationFrame(() => {
              if (boardId) {
                socketService.endCardMove(card.id, boardId);
                dragStateRef.current.hasEmittedEnd = true;
                dragStateRef.current.hasEmittedStart = false;
              }
            });
          }

          return (
          <CardContainer
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...(!isLockedByOther ? provided.dragHandleProps : {})}
            $isDragging={snapshot.isDragging}
            $isBeingEdited={isBeingEdited}
            $isBeingMoved={isBeingMoved}
            $editingUser={editingUser}
          >
            <CardBorder $color={theme.colors.primary} />
            
            {/* Visual feedback indicators */}
            {isBeingEdited && editingUser && editingUser !== currentUserId && (
              <>
                <StatusIndicator $type="editing">
                  {editingUser}
                </StatusIndicator>
                <UserIndicator>
                  {editingUser.charAt(0).toUpperCase()}
                </UserIndicator>
              </>
            )}
            
            {isBeingMoved && movingUser && movingUser !== currentUserId && (
              <>
                <StatusIndicator $type="moving">
                  {movingUser}
                </StatusIndicator>
                <UserIndicator>
                  {movingUser.charAt(0).toUpperCase()}
                </UserIndicator>
              </>
            )}
            
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
                    <ActionButton 
                      onClick={handleEdit} 
                      disabled={isUpdating || isDeleting || isLockedByOther}
                      title={isLockedByOther ? 'Card is locked by another user' : ''}
                    >
                      {isUpdating ? 'Updating...' : 'Edit'}
                    </ActionButton>
                    {(userRole === 'admin' || userRole === 'owner') && (
                      <ActionButton 
                        onClick={handleDelete} 
                        $danger 
                        disabled={isUpdating || isDeleting || isLockedByOther}
                        title={isLockedByOther ? 'Card is locked by another user' : ''}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </ActionButton>
                    )}
                  </div>
                )}
              </CardActions>
            </CardBottom>
            
            {/* Visual feedback for locked cards is handled by reduced opacity in styles */}
          </CardContainer>
          );
        }}
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