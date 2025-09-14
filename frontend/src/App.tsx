import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BoardView from './components/BoardView';
import AdminPanel from './components/AdminPanel';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ModalProvider } from './hooks/useModal';
import GlobalStyle from './styles/global';
import darkTheme from './styles/themes/dark';
import lightTheme from './styles/themes/light';

// Import aggressive network error suppression
import './utils/networkErrorSuppressor';

// Register service worker for network error suppression
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

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
  
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyle/>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />} />
          <Route path="/reset-password" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />} />
          <Route path="/verify-email" element={!isAuthenticated ? <VerifyEmail /> : <Navigate to="/" replace />} />
          
          {/* Admin route */}
          <Route path="/admin" element={
            isAuthenticated ? (
              <SocketProvider>
                <NotificationProvider>
                  <ModalProvider>
                    <AdminPanel />
                  </ModalProvider>
                </NotificationProvider>
              </SocketProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            isAuthenticated ? (
              <SocketProvider>
                <NotificationProvider>
                  <ModalProvider>
                    <div className="App">
                      {currentView === 'dashboard' ? (
                        <Dashboard 
                          toggleTheme={toggleTheme} 
                          onViewBoard={handleViewBoard}
                        />
                      ) : (
                        <BoardView 
                          boardId={currentBoardId!}
                          toggleTheme={toggleTheme}
                          onBackToDashboard={handleBackToDashboard}
                        />
                      )}
                    </div>
                  </ModalProvider>
                </NotificationProvider>
              </SocketProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Router>
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
