import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '../../services/cardService';
import { canCreateCards, UserRole } from '../../utils/permissions';
import CardComponent from '../Card';
import Modal from '../Modal';
import { CardsList, Container, ColumnHeader, AddCardButton, DragHandle } from './styles';

interface ColumnProps {
  id: string;
  title: string;
  cards: Card[];
  userRole?: UserRole;
  onCreateCard?: (cardData: any) => void;
  onUpdateCard?: (cardId: string, updates: any) => void;
  onDeleteCard?: (cardId: string) => void;
  // Visual feedback props
  editingCards?: Map<string, { userId: string; userName: string; field?: string }>;
  movingCards?: Map<string, { userId: string; userName: string }>;
  currentUserId?: string;
  boardId?: string;
  // Column reordering props
  index: number;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  cards, 
  userRole = 'viewer',
  onCreateCard, 
  onUpdateCard, 
  onDeleteCard,
  editingCards,
  movingCards,
  currentUserId,
  boardId,
  index
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateCard = (cardData: any) => {
    if (onCreateCard) {
      onCreateCard({
        ...cardData,
        column_id: id
      });
    }
    setShowCreateModal(false);
  };

  const handleUpdateCard = (cardId: string, updates: any) => {
    if (onUpdateCard) {
      onUpdateCard(cardId, updates);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (onDeleteCard) {
      onDeleteCard(cardId);
    }
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <>
          <Container
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              opacity: snapshot.isDragging ? 0.8 : 1,
            }}
          >
            <ColumnHeader>
              <DragHandle {...provided.dragHandleProps}>
                ⋮⋮
              </DragHandle>
              <h2>{title}</h2>
              <span>{cards.length}</span>
            </ColumnHeader>
        
            <Droppable droppableId={id}>
              {(provided) => (
                <CardsList ref={provided.innerRef} {...provided.droppableProps}>
                  {cards
                    .sort((a, b) => a.position - b.position)
                    .map((card, index) => (
                      <CardComponent 
                        key={card.id} 
                        card={card} 
                        index={index}
                        userRole={userRole}
                        onUpdate={handleUpdateCard}
                        onDelete={handleDeleteCard}
                        isBeingEdited={editingCards?.has(card.id) || false}
                        isBeingMoved={movingCards?.has(card.id) || false}
                        editingUser={editingCards?.get(card.id)?.userName}
                        movingUser={movingCards?.get(card.id)?.userName}
                        currentUserId={currentUserId}
                        boardId={boardId}
                      />
                    ))
                  }
                  {provided.placeholder}
                </CardsList>
              )}
            </Droppable>
        
            {canCreateCards(userRole) && (
              <AddCardButton onClick={() => setShowCreateModal(true)}>
                + Add a card
              </AddCardButton>
            )}
          </Container>

          {showCreateModal && (
            <Modal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateCard}
              title="Create New Card"
            />
          )}
        </>
      )}
    </Draggable>
  );
};

export default Column;