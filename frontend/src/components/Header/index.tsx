import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../UserMenu';
import { 
  HeaderContainer, 
  Logo, 
  UserSection, 
  UserAvatar, 
  UserName,
  ThemeToggle,
  ToggleIcon
} from './styles';
import SunIcon from '../../assets/sun.png';
import MoonIcon from '../../assets/moon.png';

interface HeaderProps {
  toggleTheme?: () => void;
  currentTheme?: string;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, currentTheme }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <HeaderContainer>
      <Logo>
        <h2>Kanban Board</h2>
      </Logo>
      
      <UserSection>
        {toggleTheme && (
          <ThemeToggle onClick={toggleTheme}>
            <ToggleIcon 
              src={currentTheme === 'light' ? SunIcon : MoonIcon} 
              alt={currentTheme === 'light' ? 'Sun' : 'Moon'}
            />
          </ThemeToggle>
        )}
        
        <UserAvatar onClick={handleUserClick}>
          {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
        </UserAvatar>
        
        <UserName onClick={handleUserClick}>
          {user?.first_name} {user?.last_name}
        </UserName>
        
        {showUserMenu && (
          <UserMenu 
            user={user} 
            onClose={() => setShowUserMenu(false)}
            onLogout={handleLogout}
          />
        )}
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;
