import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

export const BoardHeader = styled.div`
  padding: 2.5rem 2rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.components_background}, ${({ theme }) => theme.colors.background});
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.components_background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

export const BoardTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: -0.02em;
`;

export const BoardDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text_secondary};
  font-size: 1.1rem;
  opacity: 0.9;
`;

export const ColumnsContainer = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2.5rem;
  overflow-x: auto;
  min-height: calc(100vh - 200px);
  background-color: ${({ theme }) => theme.colors.background};
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary_hover};
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  
  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text_secondary};
  }
`;
