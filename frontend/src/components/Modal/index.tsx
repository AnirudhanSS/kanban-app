import React, { useEffect, useState } from 'react';

import CloseIcon from '../../assets/close.png';
import { useModal } from '../../hooks/useModal';
import { 
  Container, 
  Input, 
  Button,
  ModalContent, 
  MultilineInput, 
  // CategoriesContainer, 
  // LabelContainer,
  ErrorMessage
} from './styles';

interface ModalProps{
  visible?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  title?: string;
  initialData?: any;
}

const Modal: React.FC<ModalProps> = ({visible, isOpen, onClose, onSubmit, title: modalTitle, initialData}) => {
  const { toggleVisibility, selectedCard } = useModal(); 

  const [cardTitle, setCardTitle] = useState<string>(initialData?.title || selectedCard?.title || '');
  const [description, setDescription] = useState<string>(initialData?.description || selectedCard?.description || '');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Determine if modal should be visible
  const isVisible = isOpen !== undefined ? isOpen : visible;

  useEffect(() => {
    setCardTitle(initialData?.title || selectedCard?.title || '');
    setDescription(initialData?.description || selectedCard?.description || '');
  }, [selectedCard, initialData, isVisible])

  const handleSave = () => {
    if (!cardTitle){
      setErrorMessage("The title field can't be empty!")
      return;
    }

    setErrorMessage(undefined);

    const cardData = {
      title: cardTitle,
      description,
      due_date: initialData?.due_date,
      priority: initialData?.priority
    };

    // Always use onSubmit if provided (for API-based operations)
    if (onSubmit) {
      onSubmit(cardData);
      handleCloseModal();
    } else {
      // Fallback for legacy useModal hook (if still needed)
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    } else {
      toggleVisibility(undefined);
    }
    setCardTitle('');
    setDescription('');
    setErrorMessage(undefined);
  };

  

  if (!isVisible) return null;

  return (
    <Container>
      <ModalContent>
        <img src={CloseIcon} alt="Gray X icon" onClick={handleCloseModal}/>

        <h3>{modalTitle || 'Title'}</h3>
        <Input value={cardTitle} onChange={(e) => setCardTitle(e.target.value)} minLength={1} maxLength={50} $containsError={!!errorMessage}/>
        {errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}

        <h3>Description</h3>
        <MultilineInput 
          aria-multiline 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          maxLength={300}
        />

        <Button type='button' onClick={handleSave}>{selectedCard ? 'Save Changes' : 'Add Card'}</Button>

      </ModalContent>
    </Container>
  )
}

export default Modal;