import styled from 'styled-components';

export const CommentsContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
`;

export const CommentsHeader = styled.div`
  margin-bottom: 16px;
  
  h4 {
    margin: 0;
    color: ${props => props.theme.colors.text};
    font-size: 16px;
    font-weight: 600;
  }
`;

export const CommentsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.text_secondary};
  }
`;

export const AddCommentForm = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
`;

export const CommentInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.text_secondary};
  }
`;

export const CommentButtons = styled.div`
  display: flex;
  justify-content: flex-end;

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    background-color: ${props => props.theme.colors.primary};
    color: white;

    &:hover:not(:disabled) {
      background-color: ${props => props.theme.colors.primary_hover};
      transform: translateY(-1px);
    }

    &:disabled {
      background-color: ${props => props.theme.colors.text_secondary};
      cursor: not-allowed;
      transform: none;
    }
  }
`;

export const NoCommentsMessage = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.text_secondary};
  font-style: italic;
  padding: 20px;
  font-size: 14px;
`;
