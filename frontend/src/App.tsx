import { useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';

import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import BoardView from './components/BoardView';
import Login from './components/Auth/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './hooks/useModal';
import store from './store';
import GlobalStyle from './styles/global';
import darkTheme from './styles/themes/dark';
import lightTheme from './styles/themes/light';

const AppContent: React.FC = () => {
  const [theme, setTheme] = useState(lightTheme);
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  const toggleTheme = () => {
    setTheme(theme.title === 'light' ? darkTheme : lightTheme);
  }

  const handleViewBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
    setCurrentView('board');
  };

  const handleBackToDashboard = () => {
    setCurrentBoardId(null);
    setCurrentView('dashboard');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <SocketProvider>
      <NotificationProvider>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ModalProvider>
              <div className="App">
                <GlobalStyle/>
                {currentView === 'dashboard' ? (
                  <Dashboard 
                    toggleTheme={toggleTheme} 
                    onViewBoard={handleViewBoard}
                  />
                ) : currentBoardId ? (
                  <BoardView 
                    boardId={currentBoardId}
                    toggleTheme={toggleTheme}
                    onBackToDashboard={handleBackToDashboard}
                  />
                ) : (
                  <KanbanBoard toggleTheme={toggleTheme}/>
                )}
              </div>
            </ModalProvider>
          </ThemeProvider>
        </Provider>
      </NotificationProvider>
    </SocketProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
