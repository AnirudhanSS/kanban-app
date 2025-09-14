import React, { useState } from 'react';
import { boardTemplates, BoardTemplate } from '../../services/boardTemplateService';
import { 
  TemplateSelectorContainer, 
  TemplateGrid, 
  TemplateCard, 
  TemplateName, 
  TemplateDescription, 
  TemplateColumns,
  ColumnTag,
  SelectButton,
  CustomTemplateSection,
  ExportButton,
  ImportButton,
  HiddenFileInput
} from './styles';

interface BoardTemplateSelectorProps {
  onSelectTemplate: (template: BoardTemplate) => void;
  onExportTemplate?: () => void;
  onImportTemplate?: (template: BoardTemplate) => void;
  currentBoard?: any;
}

const BoardTemplateSelector: React.FC<BoardTemplateSelectorProps> = ({
  onSelectTemplate,
  onExportTemplate,
  onImportTemplate,
  currentBoard
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null);
  const [showImport, setShowImport] = useState(false);

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string) as BoardTemplate;
        if (onImportTemplate) {
          onImportTemplate(template);
        }
      } catch (error) {
        alert('Invalid template file. Please select a valid JSON template file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportTemplate = () => {
    if (!currentBoard || !onExportTemplate) return;
    
    const template = {
      id: `custom-${Date.now()}`,
      name: `${currentBoard.title} Template`,
      description: `Template based on ${currentBoard.title} board`,
      columns: currentBoard.Columns?.map((col: any, index: number) => ({
        title: col.title,
        position: index
      })) || [],
      cards: currentBoard.Cards?.map((card: any) => ({
        title: card.title,
        description: card.description || '',
        columnTitle: currentBoard.Columns?.find((col: any) => col.id === card.column_id)?.title || '',
        priority: card.priority || 'medium'
      })) || []
    };

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <TemplateSelectorContainer>
      <h3>Choose a Board Template</h3>
      
      <TemplateGrid>
        {boardTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            selected={selectedTemplate?.id === template.id}
            onClick={() => handleTemplateSelect(template)}
          >
            <TemplateName>{template.name}</TemplateName>
            <TemplateDescription>{template.description}</TemplateDescription>
            <TemplateColumns>
              {template.columns.map((column, index) => (
                <ColumnTag key={index}>{column.title}</ColumnTag>
              ))}
            </TemplateColumns>
          </TemplateCard>
        ))}
      </TemplateGrid>

      {selectedTemplate && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <SelectButton onClick={handleConfirmSelection}>
            Use "{selectedTemplate.name}" Template
          </SelectButton>
        </div>
      )}

      <CustomTemplateSection>
        <h4>Custom Templates</h4>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {currentBoard && (
            <ExportButton onClick={handleExportTemplate}>
              📤 Export Current Board as Template
            </ExportButton>
          )}
          
          <ImportButton onClick={() => setShowImport(!showImport)}>
            📥 Import Template
          </ImportButton>
          
          {showImport && (
            <HiddenFileInput
              type="file"
              accept=".json"
              onChange={handleFileImport}
            />
          )}
        </div>
      </CustomTemplateSection>
    </TemplateSelectorContainer>
  );
};

export default BoardTemplateSelector;
