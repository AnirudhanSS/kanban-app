import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

export const Container = styled.div<{ $isVisible: boolean; type: string }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 400px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      default: return '#2196F3';
    }
  }};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${props => props.$isVisible ? slideIn : slideOut} 0.3s ease-in-out;
  animation-fill-mode: forwards;
`;

export const Content = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;
