import styled from 'styled-components';

export const CommentContainer = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  background: ${props => props.theme.colors.background};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

export const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
`;

export const CommentDate = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.text_secondary};
`;

export const CommentContent = styled.div`
  margin-bottom: 8px;
`;

export const CommentText = styled.p`
  margin: 0;
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
  font-size: 14px;
  word-wrap: break-word;
`;

export const CommentActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

export const ReplyButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primary}20;
  }
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.text_secondary};
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.text_secondary}20;
  }
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.bug};
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.bug}20;
  }
`;

export const CommentForm = styled.div`
  margin-top: 8px;
`;

export const CommentInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text_secondary};
  }
`;

export const CommentButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:first-child {
      background-color: ${props => props.theme.colors.primary};
      color: white;

      &:hover:not(:disabled) {
        background-color: ${props => props.theme.colors.primary_hover};
      }

      &:disabled {
        background-color: ${props => props.theme.colors.text_secondary};
        cursor: not-allowed;
      }
    }

    &:last-child {
      background-color: transparent;
      color: ${props => props.theme.colors.text_secondary};
      border: 1px solid ${props => props.theme.colors.border};

      &:hover {
        background-color: ${props => props.theme.colors.text_secondary}10;
      }
    }
  }
`;
