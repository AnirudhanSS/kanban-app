import styled from 'styled-components';

export const TemplateSelectorContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  h3 {
    text-align: center;
    margin-bottom: 30px;
    color: ${props => props.theme.colors.text};
    font-size: 1.5rem;
  }

  h4 {
    margin: 30px 0 15px 0;
    color: ${props => props.theme.colors.text};
    text-align: center;
  }
`;

export const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

export const TemplateCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.background};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  ${props => props.selected && `
    background: ${props.theme.colors.primary}10;
    box-shadow: 0 4px 12px ${props.theme.colors.primary}30;
  `}
`;

export const TemplateName = styled.h4`
  margin: 0 0 10px 0;
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
`;

export const TemplateDescription = styled.p`
  margin: 0 0 15px 0;
  color: ${props => props.theme.colors.text_secondary};
  font-size: 0.9rem;
  line-height: 1.4;
`;

export const TemplateColumns = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ColumnTag = styled.span`
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

export const SelectButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.primary_hover};
    transform: translateY(-1px);
  }
`;

export const CustomTemplateSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export const ExportButton = styled.button`
  background: ${props => props.theme.colors.deploy || '#28a745'};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }
`;

export const ImportButton = styled.button`
  background: #ffc107;
  color: ${props => props.theme.colors.text};
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e0a800;
    transform: translateY(-1px);
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;
