export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canCreateCards: boolean;
  canMoveCards: boolean;
  canComment: boolean;
  canEditComments: boolean;
  canDeleteComments: boolean;
  canManageBoard: boolean;
}

export const getPermissions = (userRole: UserRole): Permission => {
  switch (userRole) {
    case 'owner':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canCreateCards: true,
        canMoveCards: true,
        canComment: true,
        canEditComments: true,
        canDeleteComments: true,
        canManageBoard: true,
      };
    
    case 'admin':
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canCreateCards: true,
        canMoveCards: true,
        canComment: true,
        canEditComments: true,
        canDeleteComments: true,
        canManageBoard: false, // Cannot delete board or change board settings
      };
    
    case 'editor':
      return {
        canView: true,
        canEdit: true,
        canDelete: false, // Cannot delete cards
        canManageMembers: false,
        canCreateCards: true,
        canMoveCards: true,
        canComment: true,
        canEditComments: true, // Can edit own comments
        canDeleteComments: true, // Can delete own comments
        canManageBoard: false,
      };
    
    case 'viewer':
    default:
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canCreateCards: false,
        canMoveCards: false,
        canComment: false,
        canEditComments: false,
        canDeleteComments: false,
        canManageBoard: false,
      };
  }
};

export const hasPermission = (userRole: UserRole, permission: keyof Permission): boolean => {
  const permissions = getPermissions(userRole);
  return permissions[permission];
};

export const canEditComment = (userRole: UserRole, commentUserId: string, currentUserId: string): boolean => {
  const permissions = getPermissions(userRole);
  
  // Admin and owner can edit any comment
  if (permissions.canEditComments && ['admin', 'owner'].includes(userRole)) {
    return true;
  }
  
  // Editor can edit their own comments
  if (permissions.canEditComments && userRole === 'editor' && commentUserId === currentUserId) {
    return true;
  }
  
  return false;
};

export const canDeleteComment = (userRole: UserRole, commentUserId: string, currentUserId: string): boolean => {
  const permissions = getPermissions(userRole);
  
  // Admin and owner can delete any comment
  if (permissions.canDeleteComments && ['admin', 'owner'].includes(userRole)) {
    return true;
  }
  
  // Editor can delete their own comments
  if (permissions.canDeleteComments && userRole === 'editor' && commentUserId === currentUserId) {
    return true;
  }
  
  return false;
};

export const canDeleteCard = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canDelete');
};

export const canManageMembers = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canManageMembers');
};

export const canCreateCards = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canCreateCards');
};

export const canMoveCards = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canMoveCards');
};

export const canComment = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canComment');
};

export const canManageBoard = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'canManageBoard');
};
