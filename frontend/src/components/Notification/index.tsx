import React, { useEffect, useState } from 'react';
import { Container, Content, CloseButton } from './styles';

interface NotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <Container $isVisible={isVisible} type={type}>
      <Content>
        {message}
        <CloseButton onClick={handleClose}>×</CloseButton>
      </Content>
    </Container>
  );
};

export default Notification;
