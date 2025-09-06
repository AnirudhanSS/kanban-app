import styled from "styled-components";

interface ColorProps {
  $color: string;
}

interface CardContainerProps {
  $isDragging?: boolean;
  $isBeingEdited?: boolean;
  $isBeingMoved?: boolean;
  $editingUser?: string;
}

export const CardContainer = styled.div<CardContainerProps>`
  background-color: ${({ theme }) => theme.colors.components_background};
  opacity: ${({ $isDragging, $isBeingEdited, $isBeingMoved }) => {
    if ($isDragging) return 0.8;
    if ($isBeingEdited) return 0.6;
    if ($isBeingMoved) return 0.8;
    return 1;
  }};
  transform: ${({ $isDragging }) => $isDragging ? 'rotate(2deg) scale(1.02)' : 'none'};

  width: 280px;
  min-height: 140px;
  margin: 0.75rem 0;
  padding: 1.25rem;

  border-radius: 12px;
  border: 1px solid ${({theme, $isBeingEdited, $isBeingMoved}) => {
    if ($isBeingEdited) return theme.colors.primary;
    if ($isBeingMoved) return theme.colors.feature;
    return theme.colors.border;
  }};
  box-shadow: ${({ $isDragging, $isBeingEdited, $isBeingMoved }) => {
    if ($isDragging) return '0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(235, 98, 47, 0.2)';
    if ($isBeingEdited) return '0 4px 16px rgba(0, 123, 255, 0.2), 0 0 0 2px rgba(0, 123, 255, 0.3)';
    if ($isBeingMoved) return '0 4px 16px rgba(40, 167, 69, 0.2), 0 0 0 2px rgba(40, 167, 69, 0.3)';
    return '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)';
  }};

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  position: relative;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Pulsing animation for moving state */
  ${({ $isBeingMoved }) => $isBeingMoved && `
    animation: pulse 1.5s ease-in-out infinite;
    
    @keyframes pulse {
      0%, 100% { 
        box-shadow: 0 4px 16px rgba(40, 167, 69, 0.2), 0 0 0 2px rgba(40, 167, 69, 0.3);
      }
      50% { 
        box-shadow: 0 4px 16px rgba(40, 167, 69, 0.4), 0 0 0 3px rgba(40, 167, 69, 0.5);
      }
    }
  `}

  &:hover {
    box-shadow: ${({ $isBeingEdited, $isBeingMoved }) => {
      if ($isBeingEdited) return '0 4px 16px rgba(0, 123, 255, 0.3), 0 0 0 2px rgba(0, 123, 255, 0.4)';
      if ($isBeingMoved) return '0 4px 16px rgba(40, 167, 69, 0.3), 0 0 0 2px rgba(40, 167, 69, 0.4)';
      return '0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)';
    }};
    transform: translateY(-2px);
    border-color: ${({theme, $isBeingEdited, $isBeingMoved}) => {
      if ($isBeingEdited) return theme.colors.primary;
      if ($isBeingMoved) return theme.colors.feature;
      return theme.colors.primary;
    }};
  }

  &:active {
    cursor: grabbing;
  }
`

export const CardBorder = styled.div<ColorProps>`
  cursor: grab;
  position: absolute;
  width: calc(100% + 2px);
  top: -1px;
  left: -1px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  height: 10px;
  background-color: ${({$color}) => $color};

  &:before{
    content: '';
    height: 0.5px;
    width: 80px;
    background-color: #ffffff;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 0);
  }
`

export const CardTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
  letter-spacing: -0.01em;
`;

export const CardDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text_secondary};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  opacity: 0.9;
`;

export const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  
  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text_secondary};
  }
  
  div {
    display: flex;
    gap: 0.5rem;
  }
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  background: ${({ theme, $danger }) => $danger ? 'transparent' : theme.colors.components_background};
  border: 1px solid ${({ theme, $danger }) => $danger ? theme.colors.bug : theme.colors.border};
  color: ${({ theme, $danger }) => $danger ? theme.colors.bug : theme.colors.text};
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background-color: ${({ theme, $danger }) => $danger ? theme.colors.bug : theme.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CardBottom = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`;

export const UserIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid ${({ theme }) => theme.colors.components_background};
`;

export const StatusIndicator = styled.div<{ $type: 'editing' | 'moving' }>`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${({ theme, $type }) =>
    $type === 'editing' ? theme.colors.primary : theme.colors.feature
  };
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &::before {
    content: ${({ $type }) => $type === 'editing' ? '"✏️"' : '"🔄"'};
    margin-right: 4px;
  }
`;

// LockOverlay and LockIcon removed - using reduced opacity for visual feedback instead