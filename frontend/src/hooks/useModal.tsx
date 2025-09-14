import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Card } from '../services/cardService';

interface ModalContextData {
  visible: boolean;
  toggleVisibility: (card: Card | undefined) => void;
  selectedCard: Card | undefined;
}

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData);

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<Card | undefined>();

  const toggleVisibility = (card: Card | undefined) => {
    if (card) setSelectedCard(card);
    else setSelectedCard(undefined);
    setVisible(!visible);
  }

  return (
    <ModalContext.Provider value={{ visible, toggleVisibility, selectedCard }}>
      {children}
    </ModalContext.Provider>
  );
};

function useModal(): ModalContextData {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }

  return context;
}

export { ModalProvider, useModal };
