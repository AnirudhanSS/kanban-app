import React, { useState, useEffect } from 'react';
import { adminService, AdminBoard, AdminMember, AuditLog, ActiveUser } from '../../services/adminService';
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
  OnlineIndicator,
  OfflineIndicator
} from './styles';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'boards' | 'users' | 'audit'>('overview');
  const [boards, setBoards] = useState<AdminBoard[]>([]);
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [boardsData, membersData, auditData, usersData] = await Promise.all([
        adminService.getBoards(),
        adminService.getMembers(),
        adminService.getAuditLogs(),
        adminService.getActiveUsers()
      ]);
      
      setBoards(boardsData);
      setMembers(membersData);
      setAuditLogs(auditData);
      setActiveUsers(usersData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getUniqueUsers = () => {
    const uniqueUsers = new Set(members.map(m => m.userId));
    return uniqueUsers.size;
  };

  const getOnlineUsers = () => {
    return activeUsers.length;
  };

  const getTotalBoards = () => {
    return boards.length;
  };

  const getRecentActivity = () => {
    return auditLogs.slice(0, 10);
  };

  if (isLoading) {
    return (
      <AdminContainer>
        <LoadingSpinner>Loading admin data...</LoadingSpinner>
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
        <h1>Admin Dashboard</h1>
        <button onClick={loadData}>Refresh Data</button>
      </AdminHeader>

      <AdminTabs>
        <TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </TabButton>
        <TabButton 
          $active={activeTab === 'boards'} 
          onClick={() => setActiveTab('boards')}
        >
          Boards ({getTotalBoards()})
        </TabButton>
        <TabButton 
          $active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          Users ({getUniqueUsers()})
        </TabButton>
        <TabButton 
          $active={activeTab === 'audit'} 
          onClick={() => setActiveTab('audit')}
        >
          Audit Logs
        </TabButton>
      </AdminTabs>

      <TabContent>
        {activeTab === 'overview' && (
          <div>
            <StatsGrid>
              <StatCard>
                <h3>Total Boards</h3>
                <p>{getTotalBoards()}</p>
              </StatCard>
              <StatCard>
                <h3>Total Users</h3>
                <p>{getUniqueUsers()}</p>
              </StatCard>
              <StatCard>
                <h3>Online Users</h3>
                <p>{getOnlineUsers()}</p>
              </StatCard>
              <StatCard>
                <h3>Recent Activity</h3>
                <p>{auditLogs.length} total events</p>
              </StatCard>
            </StatsGrid>

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
                {getRecentActivity().map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {activeTab === 'boards' && (
          <div>
            <h3>All Boards</h3>
            <Table>
              <TableHeader>
                <tr>
                  <th>Board Name</th>
                  <th>Members</th>
                  <th>Roles</th>
                </tr>
              </TableHeader>
              <tbody>
                {boards.map((board) => (
                  <TableRow key={board.id}>
                    <TableCell>{board.name}</TableCell>
                    <TableCell>{board.members.length}</TableCell>
                    <TableCell>
                      {board.members.map(m => m.role).join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3>All Users</h3>
            <Table>
              <TableHeader>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Status</th>
                  <th>Boards</th>
                </tr>
              </TableHeader>
              <tbody>
                {members.map((member) => (
                  <TableRow key={`${member.boardId}-${member.userId}`}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.username}</TableCell>
                    <TableCell>
                      {member.online ? (
                        <OnlineIndicator>Online</OnlineIndicator>
                      ) : (
                        <OfflineIndicator>Offline</OfflineIndicator>
                      )}
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <h3>Audit Logs</h3>
            <Table>
              <TableHeader>
                <tr>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>User ID</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </TableHeader>
              <tbody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell>{log.entity_id}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </TabContent>
    </AdminContainer>
  );
};

export default AdminPanel;
