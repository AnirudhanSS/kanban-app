import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

export const WelcomeSection = styled.div`
  padding: 2rem 10rem;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.text};
  }
  
  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text_secondary};
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    
    h1 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
`;

export const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 0 10rem;

  @media (max-width: 768px) {
    padding: 0 2rem;
    gap: 1rem;
  }
`;

export const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.components_background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  min-width: 120px;
  
  h3 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text_secondary};
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    min-width: 100px;
    
    h3 {
      font-size: 1.5rem;
    }
  }
`;

export const QuickActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  padding: 0 10rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 0 2rem;
    gap: 0.5rem;
  }
`;

export const ActionButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary_hover || theme.colors.primary};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

export const BoardsSection = styled.div`
  padding: 0 10rem 3rem;
  
  @media (max-width: 768px) {
    padding: 0 2rem 2rem;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 0.5rem;
  display: inline-block;
`;

export const BoardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  p {
    grid-column: 1 / -1;
    text-align: center;
    color: ${({ theme }) => theme.colors.text_secondary};
    font-style: italic;
    padding: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;
