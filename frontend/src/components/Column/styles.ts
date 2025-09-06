import styled from "styled-components";

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.components_background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 1.5rem;
  min-width: 320px;
  max-width: 320px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
`;

export const ColumnHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    letter-spacing: -0.02em;
    flex: 1;
  }
  
  span {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: 0.3rem 0.7rem;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    min-width: 24px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(235, 98, 47, 0.3);
  }
`;

export const DragHandle = styled.div`
  cursor: grab;
  color: ${({ theme }) => theme.colors.text_secondary};
  font-size: 1.2rem;
  margin-right: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background_secondary};
    color: ${({ theme }) => theme.colors.text};
  }
  
  &:active {
    cursor: grabbing;
  }
`;

export const CardsList = styled.div`
  min-height: 200px;
  overflow: visible;
  flex: 1;
  margin-bottom: 1rem;
`;

export const AddCardButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}15, ${({ theme }) => theme.colors.primary}08);
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}25, ${({ theme }) => theme.colors.primary}15);
    border-color: ${({ theme }) => theme.colors.primary_hover};
    color: ${({ theme }) => theme.colors.primary_hover};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(235, 98, 47, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;