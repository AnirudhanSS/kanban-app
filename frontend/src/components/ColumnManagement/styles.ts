import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  padding: 2rem;
`;

export const Header = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }
`;

export const CloseButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background: #d32f2f;
  }
`;

export const Content = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0 0 8px 8px;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

export const ColumnItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
`;

export const DragHandle = styled.div`
  cursor: grab;
  color: #999;
  font-size: 1.2rem;
  padding: 0.5rem;
  
  &:hover {
    color: #666;
  }
`;

export const ColumnTitle = styled.div`
  flex: 1;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  span {
    display: block;
    min-height: 1.2rem;
  }
`;

export const ColumnActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const ActionButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#EB622F' : 'white'};
  color: ${props => props.$primary ? 'white' : '#666'};
  border: 1px solid ${props => props.$primary ? '#EB622F' : '#e0e0e0'};
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#d54e1f' : '#f0f0f0'};
    border-color: ${props => props.$primary ? '#d54e1f' : '#ccc'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const AddColumnForm = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
  }
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #EB622F;
    box-shadow: 0 0 0 2px rgba(235, 98, 47, 0.2);
  }
`;

export const FormButton = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#EB622F' : 'white'};
  color: ${props => props.$primary ? 'white' : '#666'};
  border: 1px solid ${props => props.$primary ? '#EB622F' : '#e0e0e0'};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$primary ? '#d54e1f' : '#f0f0f0'};
    border-color: ${props => props.$primary ? '#d54e1f' : '#ccc'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ColorPicker = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

export const ColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$selected ? '#333' : 'transparent'};
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

export const CardLimitInput = styled.input`
  width: 100px;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-left: 0.5rem;

  &:focus {
    outline: none;
    border-color: #EB622F;
    box-shadow: 0 0 0 2px rgba(235, 98, 47, 0.2);
  }
`;
