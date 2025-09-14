import styled from 'styled-components';

export const AdminContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  min-height: 100vh;
`;

export const AdminHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.colors.border};

  h1 {
    margin: 0;
    color: ${props => props.theme.colors.text};
    font-size: 2rem;
  }

  button {
    padding: 10px 20px;
    background-color: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: ${props => props.theme.colors.primary_hover};
    }
  }
`;

export const AdminTabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.text};
  border: none;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primary_hover : props.theme.colors.primary}20;
  }
`;

export const TabContent = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

export const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 10px 0;
    color: ${props => props.theme.colors.text_secondary};
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    margin: 0;
    color: ${props => props.theme.colors.text};
    font-size: 2rem;
    font-weight: 700;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const TableHeader = styled.thead`
  background: ${props => props.theme.colors.primary};
  color: white;

  th {
    padding: 15px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primary}10;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 12px;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: ${props => props.theme.colors.text_secondary};
`;

export const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.bug}20;
  color: ${props => props.theme.colors.bug};
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.bug};
  text-align: center;
  font-size: 16px;
`;

export const OnlineIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #28a745;
  font-weight: 500;

  &::before {
    content: '●';
    color: #28a745;
    font-size: 12px;
  }
`;

export const OfflineIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #6c757d;
  font-weight: 500;

  &::before {
    content: '●';
    color: #6c757d;
    font-size: 12px;
  }
`;
