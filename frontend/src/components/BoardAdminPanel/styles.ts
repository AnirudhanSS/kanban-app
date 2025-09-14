import styled from 'styled-components';

export const AdminContainer = styled.div`
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
  overflow-y: auto;
`;

export const AdminHeader = styled.div`
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h1 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
  }

  p {
    margin: 0.5rem 0 0 0;
    color: #666;
    font-size: 0.9rem;
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

export const AdminTabs = styled.div`
  background: white;
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 2rem;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.$active ? '#EB622F' : '#666'};
  border-bottom: 2px solid ${props => props.$active ? '#EB622F' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: #EB622F;
    background: #fafafa;
  }
`;

export const TabContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0 0 8px 8px;
  flex: 1;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.2rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

export const StatCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;

  h3 {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  small {
    color: #999;
    font-size: 0.8rem;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.thead`
  background: #EB622F;
  color: white;

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  color: #333;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

export const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #ffcdd2;
  text-align: center;
  font-size: 0.9rem;
`;

export const OnlineIndicator = styled.span`
  color: #4CAF50;
  font-weight: 500;
`;

export const OfflineIndicator = styled.span`
  color: #999;
  font-weight: 500;
`;
