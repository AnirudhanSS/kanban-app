import styled from "styled-components";

interface ColorProps {
  $color: string;
}

interface CardContainerProps {
  $isDragging?: boolean;
}

export const CardContainer = styled.div<CardContainerProps>`
  background-color: ${({ theme }) => theme.colors.components_background};
  opacity: ${({ $isDragging }) => $isDragging ? 0.8 : 1};
  transform: ${({ $isDragging }) => $isDragging ? 'rotate(2deg) scale(1.02)' : 'none'};

  width: 280px;
  min-height: 140px;
  margin: 0.75rem 0;
  padding: 1.25rem;

  border-radius: 12px;
  border: 1px solid ${({theme}) => theme.colors.border};
  box-shadow: ${({ $isDragging }) => 
    $isDragging 
      ? '0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(235, 98, 47, 0.2)' 
      : '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)'
  };

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  position: relative;
  cursor: grab;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
    transform: translateY(-2px);
    border-color: ${({theme}) => theme.colors.primary};
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