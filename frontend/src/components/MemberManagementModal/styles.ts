import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  backdrop-filter: blur(2px);
  isolation: isolate;
`;

export const ModalContent = styled.div`
  padding: 2rem;
  min-height: 400px;
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  background-color: ${({theme}) => theme.colors.components_background};
  border-radius: 16px;
  position: relative;
  z-index: 100000;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 8px 25px rgba(0,0,0,0.2);
  border: 1px solid ${({theme}) => theme.colors.border};
  isolation: isolate;

  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({theme}) => theme.colors.text};
    text-align: center;
  }

  @media(max-width: 768px) {
    padding: 1.5rem;
    width: 90vw;
    margin: 1rem;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  right: 1.5rem;
  top: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({theme}) => theme.colors.border};
  }

  img {
    height: 18px;
    width: 18px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  &:hover img {
    opacity: 1;
  }
`;

export const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MemberItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${({theme}) => theme.colors.border};
`;

export const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    color: ${({theme}) => theme.colors.text};
    font-weight: 600;
  }

  small {
    color: ${({theme}) => theme.colors.placeholder};
    font-size: 0.85rem;
  }
`;

export const RoleSelect = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({theme}) => theme.colors.border};
  background-color: ${({theme}) => theme.colors.components_background};
  color: ${({theme}) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.colors.primary};
  }
`;

export const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $danger, theme }) => $danger ? `
    background-color: #DB4B4B;
    color: white;
    
    &:hover {
      background-color: #C73E3E;
    }
  ` : `
    background-color: ${theme.colors.primary};
    color: white;
    
    &:hover {
      background-color: ${theme.colors.primary_hover};
    }
  `}
`;
