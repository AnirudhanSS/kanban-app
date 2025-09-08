import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Card } from '../../services/cardService';
import CardComponent from '../Card';
import Modal from '../Modal';
import { CardsList, Container, ColumnHeader, AddCardButton } from './styles';

interface ColumnProps {
  id: string;
  title: string;
  cards: Card[];
  userRole?: string;
  onCreateCard?: (cardData: any) => void;
  onUpdateCard?: (cardId: string, updates: any) => void;
  onDeleteCard?: (cardId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ 
  id, 
  title, 
  cards, 
  userRole = 'viewer',
  onCreateCard, 
  onUpdateCard, 
  onDeleteCard 
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
    <>
      <Container>
        <ColumnHeader>
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
                  />
                ))
              }
              {provided.placeholder}
            </CardsList>
          )}
        </Droppable>
        
        {(userRole === 'editor' || userRole === 'admin' || userRole === 'owner') && (
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
  );
};

export default Column;