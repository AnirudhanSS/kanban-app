import React, { useState, useEffect, useCallback } from 'react';
import { boardService } from '../../services/boardService';
import { Container, ModalContent, CloseButton, MemberList, MemberItem, MemberInfo, RoleSelect, ActionButton } from './styles';
import closeIcon from '../../assets/close.png';

interface Member {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  User: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_deleted?: boolean;
  };
}

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  currentUserRole: string;
}

const MemberManagementModal: React.FC<MemberManagementModalProps> = ({ 
  isOpen, 
  onClose, 
  boardId, 
  currentUserRole 
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading members for boardId:', boardId);
      const membersData = await boardService.getBoardMembers(boardId);
      console.log('Members data loaded:', membersData);
      setMembers(membersData);
    } catch (err: any) {
      console.error('Error loading members:', err);
      setError(err.response?.data?.error || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, boardId, loadMembers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await boardService.updateMemberRole(boardId, userId, newRole);
      setMembers(prev => prev.map(member => 
        member.user_id === userId ? { ...member, role: newRole as any } : member
      ));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await boardService.removeMember(boardId, userId);
      setMembers(prev => prev.filter(member => member.user_id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  if (!isOpen) return null;

  return (
    <Container onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </CloseButton>
        
        <h2>Manage Members</h2>
        
        {error && (
          <div style={{ color: '#DB4B4B', padding: '1rem 0', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No members found for this board.</p>
          </div>
        ) : (
          <MemberList>
            {members.map(member => (
              <MemberItem key={member.user_id}>
                <MemberInfo>
                  <div>
                    <strong>
                      {member.User ? 
                        `${member.User.first_name} ${member.User.last_name}` : 
                        'Unknown User'
                      }
                      {member.User?.is_deleted && (
                        <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                          (Deleted)
                        </span>
                      )}
                    </strong>
                    <small>
                      {member.User ? member.User.email : 'Email not available'}
                    </small>
                  </div>
                </MemberInfo>
                
                {canManageMembers && member.role !== 'owner' && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <RoleSelect
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </RoleSelect>
                    
                    <ActionButton 
                      onClick={() => handleRemoveMember(member.user_id)}
                      $danger
                    >
                      Remove
                    </ActionButton>
                  </div>
                )}
                
                {member.role === 'owner' && (
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>Owner</span>
                )}
              </MemberItem>
            ))}
          </MemberList>
        )}
      </ModalContent>
    </Container>
  );
};

export default MemberManagementModal;
