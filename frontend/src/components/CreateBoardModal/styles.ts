import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  isolation: isolate;
  backdrop-filter: blur(2px);
`;

export const Content = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 100000;
  isolation: isolate;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.text_secondary};
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.components_background};
    color: ${props => props.theme.colors.text};
  }
`;

export const Title = styled.h2`
  margin: 0 0 1.5rem 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text_secondary};
  }
`;

export const MultilineInput = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text_secondary};
  }
`;

export const ColorPicker = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

export const ColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color};
  cursor: pointer;
  border: 3px solid ${props => props.$selected ? props.theme.colors.primary : 'transparent'};
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: ${props => props.theme.colors.components_background};
  border-radius: 8px;
`;

export const ToggleLabel = styled.label`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme.colors.border};
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background: ${props => props.theme.colors.primary};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

export const Button = styled.button<{ $secondary?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;

  ${props => props.$secondary ? `
    background: ${props.theme.colors.components_background};
    color: ${props.theme.colors.text};
    border: 2px solid ${props.theme.colors.border};

    &:hover {
      background: ${props.theme.colors.border};
    }
  ` : `
    background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.primary_hover});
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;