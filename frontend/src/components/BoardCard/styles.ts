import styled from 'styled-components';

export const CardContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.components_background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

export const CardTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;
  font-weight: 600;
  flex: 1;
  line-height: 1.3;
`;

export const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.text_secondary};
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  
  small {
    color: ${({ theme }) => theme.colors.text_secondary};
    font-size: 0.8rem;
  }
`;

export const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.4rem 0.8rem;
  border: 1px solid ${({ theme, $primary, $danger }) => 
    $primary ? theme.colors.primary : 
    $danger ? theme.colors.bug : 
    theme.colors.border
  };
  border-radius: 6px;
  background-color: ${({ theme, $primary, $danger }) => 
    $primary ? theme.colors.primary : 
    $danger ? theme.colors.bug : 
    'transparent'
  };
  color: ${({ theme, $primary, $danger }) => 
    $primary || $danger ? 'white' : 
    theme.colors.text
  };
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme, $primary, $danger }) => 
      $primary ? theme.colors.primary_hover || theme.colors.primary : 
      $danger ? theme.colors.bug_hover || theme.colors.bug : 
      theme.colors.border
    };
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const OwnerBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
`;

export const PublicBadge = styled.span`
  background-color: ${({ theme }) => theme.colors.feature || '#10B981'};
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
`;
