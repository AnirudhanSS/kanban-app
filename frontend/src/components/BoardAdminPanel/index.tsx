import React, { useState, useEffect, useCallback } from 'react';
import { boardAdminService, BoardMember, BoardAuditLog, BoardStats } from '../../services/boardAdminService';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  AdminContainer, 
  AdminHeader, 
  AdminTabs, 
  TabButton, 
  TabContent, 
  StatsGrid, 
  StatCard, 
  Table, 
  TableHeader, 
  TableRow, 
  TableCell, 
  LoadingSpinner, 
  ErrorMessage,
  CloseButton
} from './styles';

interface BoardAdminPanelProps {
  boardId: string;
  boardName: string;
  onClose: () => void;
}

const BoardAdminPanel: React.FC<BoardAdminPanelProps> = ({ boardId, boardName, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activity'>('overview');
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<BoardAuditLog[]>([]);
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [membersData, auditData, statsData] = await Promise.all([
        boardAdminService.getBoardMembers(boardId),
        boardAdminService.getBoardAuditLogs(boardId),
        boardAdminService.getBoardStats(boardId)
      ]);
      
      setMembers(membersData);
      setAuditLogs(auditData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load board admin data');
      showNotification('Failed to load admin data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [boardId, showNotification]);

  useEffect(() => {
    loadData();
  }, [boardId, loadData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getActionDisplayName = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'CardCreated': 'Card Created',
      'CardUpdated': 'Card Updated',
      'CardDeleted': 'Card Deleted',
      'CardMoved': 'Card Moved',
      'ColumnsReordered': 'Columns Reordered',
      'CommentCreated': 'Comment Added',
      'CommentUpdated': 'Comment Updated',
      'CommentDeleted': 'Comment Deleted'
    };
    return actionMap[action] || action;
  };

  const getEntityDisplayName = (entityType: string) => {
    const entityMap: { [key: string]: string } = {
      'card': 'Card',
      'comment': 'Comment',
      'board': 'Board',
      'column': 'Column'
    };
    return entityMap[entityType] || entityType;
  };

  if (isLoading) {
    return (
      <AdminContainer>
        <LoadingSpinner>Loading board admin data...</LoadingSpinner>
      </AdminContainer>
    );
  }

  if (error) {
    return (
      <AdminContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminHeader>
        <div>
          <h1>Board Admin Panel</h1>
          <p>{boardName}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={loadData} style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#EB622F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Refresh Data
          </button>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </div>
      </AdminHeader>

      <AdminTabs>
        <TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton 
          $active={activeTab === 'members'} 
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </TabButton>
        <TabButton 
          $active={activeTab === 'activity'} 
          onClick={() => setActiveTab('activity')}
        >
          Activity ({auditLogs.length})
        </TabButton>
      </AdminTabs>

      <TabContent>
        {activeTab === 'overview' && stats && (
          <>
            <StatsGrid>
              <StatCard>
                <h3>Total Members</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EB622F' }}>
                  {stats.totalMembers}
                </div>
              </StatCard>
              {/* Online Members stat removed - not working correctly */}
              <StatCard>
                <h3>Recent Activity</h3>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
                  {stats.recentActivity}
                </div>
                <small>Last 7 days</small>
              </StatCard>
            </StatsGrid>
          </>
        )}

        {activeTab === 'members' && (
          <>
            <h3>Board Members</h3>
            <Table>
              <TableHeader>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* Status column removed - not working correctly */}
                </tr>
              </TableHeader>
              <tbody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        backgroundColor: member.role === 'owner' ? '#f44336' : 
                                        member.role === 'admin' ? '#ff9800' : 
                                        member.role === 'editor' ? '#2196f3' : '#9e9e9e',
                        color: 'white'
                      }}>
                        {member.role}
                      </span>
                    </TableCell>
                    {/* Status cell removed - not working correctly */}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {activeTab === 'activity' && (
          <>
            <h3>Recent Activity</h3>
            <Table>
              <TableHeader>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>User</th>
                  <th>Time</th>
                </tr>
              </TableHeader>
              <tbody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        backgroundColor: log.action.includes('create') || log.action.includes('Created') ? '#4caf50' :
                                        log.action.includes('update') || log.action.includes('Updated') ? '#ff9800' :
                                        log.action.includes('delete') || log.action.includes('Deleted') ? '#f44336' : '#2196f3',
                        color: 'white'
                      }}>
                        {getActionDisplayName(log.action)}
                      </span>
                    </TableCell>
                    <TableCell>{getEntityDisplayName(log.entity_type)}</TableCell>
                    <TableCell>
                      {log.User ? `${log.User.first_name} ${log.User.last_name || ''}`.trim() : log.user_id}
                    </TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </TabContent>
    </AdminContainer>
  );
};

export default BoardAdminPanel;
