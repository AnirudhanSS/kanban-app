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
  padding: 2.5rem;
  min-height: 400px;
  width: 500px;
  background-color: ${({theme}) => theme.colors.components_background};
  border-radius: 16px;
  position: relative;
  z-index: 100000;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 8px 25px rgba(0,0,0,0.2);
  border: 1px solid ${({theme}) => theme.colors.border};
  isolation: isolate;

  h2 {
    margin: 0 0 1rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({theme}) => theme.colors.text};
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: ${({theme}) => theme.colors.text};
    font-size: 0.9rem;
  }

  @media(max-width: 768px) {
    padding: 2rem;
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

export const Input = styled.input`
  width: 100%;
  height: 3rem;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 2px solid ${({theme}) => theme.colors.border};
  background-color: ${({theme}) => theme.colors.components_background};
  color: ${({theme}) => theme.colors.text};
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({theme}) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({theme}) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({theme}) => theme.colors.placeholder};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  background: linear-gradient(135deg, ${({theme}) => theme.colors.primary}, ${({theme}) => theme.colors.primary_hover});
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 0;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(235, 98, 47, 0.3);
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(235, 98, 47, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
