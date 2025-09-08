import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import CloseIcon from '../../assets/close.png';
// import getCategoryBackgroundColor from '../../helpers/getCategoryBackgroundColor';
import { useModal } from '../../hooks/useModal';
import { useAppDispatch } from '../../hooks/useRedux';
// import ICategory from '../../interfaces/ICategory';
import IStatus from '../../interfaces/IStatus';
import { addCard, updateOneCard , } from '../../store/slices/cards.slice';
import { updateColumns } from '../../store/slices/columns.slice';
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
  // const [cardCategory, setCardCategory] = useState<ICategory>(initialData?.category || selectedCard?.category || ICategory.FEATURE);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const dispatch = useAppDispatch();
  
  // Determine if modal should be visible
  const isVisible = isOpen !== undefined ? isOpen : visible;

  useEffect(() => {
    setCardTitle(initialData?.title || selectedCard?.title || '');
    setDescription(initialData?.description || selectedCard?.description || '');
    // setCardCategory(initialData?.category || selectedCard?.category || ICategory.FEATURE);
  }, [selectedCard, initialData, isVisible])

  const handleSave = () => {
    if (!cardTitle){
      setErrorMessage("The title field can´t be empty!")
      return;
    }

    setErrorMessage(undefined);

    const cardData = {
      title: cardTitle,
      description,
      // category: cardCategory,
      due_date: initialData?.due_date,
      priority: initialData?.priority
    };

    if (onSubmit) {
      onSubmit(cardData);
    } else if (!selectedCard?.id) {
      const newCard = {
        id: uuidv4(),
        title: cardTitle,
        description,
        // category: cardCategory,
        status: IStatus.BACKLOG,
        hidden: false,
      }
      dispatch(addCard(newCard))
      dispatch(updateColumns(newCard.id))
      handleCloseModal();
    }

    if (selectedCard?.id) {
      const updatedCard = {
        ...selectedCard,
        title: cardTitle,
        description,
        // category: cardCategory
      }

      dispatch(updateOneCard(updatedCard))
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
    // setCardCategory(ICategory.FEATURE);
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

        {/* <CategoriesContainer>
          {Object.values(ICategory).map(category => (
            <LabelContainer key={category} $color={() => getCategoryBackgroundColor(theme, category)}>
              <label>
                <input 
                  type='radio' 
                  name={category} 
                  value={category} 
                  checked={cardCategory === category}
                  onChange={(e) => setCardCategory(e.currentTarget.value as ICategory)}
                />
                <i>{category}</i>
              </label>
            </LabelContainer>
          ))}
        </CategoriesContainer> */}
        <Button type='button' onClick={handleSave}>{selectedCard ? 'Save Changes' : 'Add card to Backlog'}</Button>

      </ModalContent>
    </Container>
  )
}

export default Modal;