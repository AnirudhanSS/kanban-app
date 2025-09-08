import styled from 'styled-components';

export const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.colors.components_background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
`;

export const UserInfo = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  strong {
    display: block;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }
`;

export const UserEmail = styled.div`
  color: ${({ theme }) => theme.colors.text_secondary};
  font-size: 0.9rem;
`;

export const MenuItem = styled.div<{ $danger?: boolean }>`
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: ${({ theme, $danger }) => $danger ? theme.colors.bug : theme.colors.text};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.border};
  }
  
  &:first-of-type {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-of-type {
    border-radius: 0 0 8px 8px;
  }
`;

export const MenuDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 0.5rem 0;
`;
