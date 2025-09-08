import React from 'react';
import { User } from '../../services/authService';
import { 
  MenuContainer, 
  MenuItem, 
  MenuDivider,
  UserInfo,
  UserEmail
} from './styles';

interface UserMenuProps {
  user: User | null;
  onClose: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onClose, onLogout }) => {
  const handleProfileClick = () => {
    // TODO: Navigate to profile page
    console.log('Profile clicked');
    onClose();
  };

  const handleSettingsClick = () => {
    // TODO: Navigate to settings page
    console.log('Settings clicked');
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <MenuContainer>
      <UserInfo>
        <div>
          <strong>{user?.first_name} {user?.last_name}</strong>
          <UserEmail>{user?.email}</UserEmail>
        </div>
      </UserInfo>
      
      <MenuDivider />
      
      <MenuItem onClick={handleProfileClick}>
        Profile
      </MenuItem>
      
      <MenuItem onClick={handleSettingsClick}>
        Settings
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem onClick={handleLogoutClick} $danger>
        Logout
      </MenuItem>
    </MenuContainer>
  );
};

export default UserMenu;
