import React from 'react';
import styled from 'styled-components';

interface LabelType {
  id: string;
  name: string;
  color: string;
}

interface LabelsProps {
  labels: LabelType[];
  onAddLabel?: (label: LabelType) => void;
  onRemoveLabel?: (labelId: string) => void;
  editable?: boolean;
}

const LabelsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 8px 0;
`;

const Label = styled.div<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const AddLabelButton = styled.button`
  background: #e1e5e9;
  border: 1px dashed #c1c8cd;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #d1d5d9;
    border-color: #a1a8ad;
  }
`;

const Labels: React.FC<LabelsProps> = ({ 
  labels = [], 
  onAddLabel, 
  onRemoveLabel, 
  editable = false 
}) => {
  const handleLabelClick = (label: LabelType) => {
    if (editable && onRemoveLabel) {
      onRemoveLabel(label.id);
    }
  };

  const handleAddLabel = () => {
    if (onAddLabel) {
      const newLabel: LabelType = {
        id: Date.now().toString(),
        name: 'New Label',
        color: '#007bff'
      };
      onAddLabel(newLabel);
    }
  };

  return (
    <LabelsContainer>
      {labels.map((label) => (
        <Label
          key={label.id}
          color={label.color}
          onClick={() => handleLabelClick(label)}
          title={editable ? 'Click to remove' : label.name}
        >
          {label.name}
        </Label>
      ))}
      {editable && onAddLabel && (
        <AddLabelButton onClick={handleAddLabel}>
          + Add Label
        </AddLabelButton>
      )}
    </LabelsContainer>
  );
};

export default Labels;
