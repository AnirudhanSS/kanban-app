import React, { useState, useEffect } from 'react';
import { columnService } from '../../services/columnService';
import { Column } from '../../services/boardService';
import { useNotification } from '../../contexts/NotificationContext';
import { canManageMembers, UserRole } from '../../utils/permissions';
import { 
  Container, 
  Header, 
  CloseButton, 
  Content, 
  ColumnList, 
  ColumnItem, 
  ColumnHeader, 
  ColumnTitle, 
  ColumnActions, 
  ActionButton, 
  AddColumnForm, 
  FormInput, 
  FormButton, 
  DragHandle
} from './styles';


interface ColumnManagementProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columns: Column[];
  userRole: UserRole;
  onColumnsUpdated: (columns: Column[]) => void;
}

const ColumnManagement: React.FC<ColumnManagementProps> = ({
  isOpen,
  onClose,
  boardId,
  columns,
  userRole,
  onColumnsUpdated
}) => {
  const { showNotification } = useNotification();
  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;

    setIsLoading(true);
    try {
      const newColumn = await columnService.createColumn(boardId, {
        title: newColumnTitle.trim(),
        position: localColumns.length
      });

      const updatedColumns = [...localColumns, newColumn];
      setLocalColumns(updatedColumns);
      onColumnsUpdated(updatedColumns);
      
      setNewColumnTitle('');
      setShowAddForm(false);
      showNotification('Column added successfully', 'success');
    } catch (error) {
      console.error('Failed to add column:', error);
      showNotification('Failed to add column', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateColumn = async (columnId: string, updates: Partial<Column>) => {
    setIsLoading(true);
    try {
      await columnService.updateColumn(columnId, updates);
      
      // Don't update local state here - let WebSocket events handle it
      // This ensures all users see the changes in real-time
      setEditingColumn(null);
      setEditingTitle('');
      showNotification('Column updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update column:', error);
      showNotification('Failed to update column', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (columnId: string, currentTitle: string) => {
    setEditingColumn(columnId);
    setEditingTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
    setEditingTitle('');
  };

  const handleSaveEdit = async (columnId: string) => {
    if (editingTitle.trim() && editingTitle.trim() !== localColumns.find(col => col.id === columnId)?.title) {
      await handleUpdateColumn(columnId, { title: editingTitle.trim() });
    } else {
      handleCancelEdit();
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this column? All cards in this column will be moved to the first column.');
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      await columnService.deleteColumn(columnId);
      
      // Don't update local state here - let WebSocket events handle it
      // This ensures all users see the changes in real-time
      showNotification('Column deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete column:', error);
      showNotification('Failed to delete column', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleReorderColumns = async (columnIds: string[]) => {
  //   setIsLoading(true);
  //   try {
  //     await columnService.reorderColumns(columnIds);
  //     
  //     // Don't update local state here - let WebSocket events handle it
  //     // This ensures all users see the changes in real-time
  //     showNotification('Columns reordered successfully', 'success');
  //   } catch (error) {
  //     console.error('Failed to reorder columns:', error);
  //     showNotification('Failed to reorder columns', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  if (!isOpen) return null;

  if (!canManageMembers(userRole)) {
    return (
      <Container>
        <Header>
          <h2>Column Management</h2>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </Header>
        <Content>
          <p>You don't have permission to manage columns.</p>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h2>Column Management</h2>
        <CloseButton onClick={onClose}>✕</CloseButton>
      </Header>
      
      <Content>
        <ColumnList>
          {localColumns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <ColumnItem key={column.id}>
                <ColumnHeader>
                  <DragHandle>⋮⋮</DragHandle>
                  <ColumnTitle
                    style={{ borderLeft: `4px solid ${column.color || '#EB622F'}` }}
                  >
                    {editingColumn === column.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FormInput
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit(column.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <button
                          onClick={() => handleSaveEdit(column.id)}
                          disabled={isLoading || !editingTitle.trim()}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading || !editingTitle.trim() ? 'not-allowed' : 'pointer',
                            opacity: isLoading || !editingTitle.trim() ? 0.6 : 1
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.6 : 1
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => handleStartEdit(column.id, column.title)}
                        style={{ cursor: 'pointer' }}
                      >
                        {column.title}
                      </span>
                    )}
                  </ColumnTitle>
                  <ColumnActions>
                    {/* Edit button removed - now using click-to-edit on column title */}
                    <ActionButton
                      onClick={() => handleDeleteColumn(column.id)}
                      title="Delete column"
                      style={{ color: '#f44336' }}
                    >
                      🗑️
                    </ActionButton>
                  </ColumnActions>
                </ColumnHeader>
                
                <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                  <div>Position: {column.position + 1}</div>
                </div>
              </ColumnItem>
            ))}
        </ColumnList>

        {showAddForm ? (
          <AddColumnForm>
            <h3>Add New Column</h3>
            <FormInput
              type="text"
              placeholder="Column title"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <FormButton
                onClick={handleAddColumn}
                disabled={!newColumnTitle.trim() || isLoading}
                $primary
              >
                {isLoading ? 'Adding...' : 'Add Column'}
              </FormButton>
              <FormButton onClick={() => setShowAddForm(false)}>
                Cancel
              </FormButton>
            </div>
          </AddColumnForm>
        ) : (
          <FormButton
            onClick={() => setShowAddForm(true)}
            $primary
            style={{ marginTop: '1rem' }}
          >
            + Add New Column
          </FormButton>
        )}
      </Content>
    </Container>
  );
};

export default ColumnManagement;
