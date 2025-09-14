import React, { useState } from 'react';
import { Comment as CommentType } from '../../services/commentService';
import { canDeleteComment, UserRole } from '../../utils/permissions';
import { 
  CommentContainer, 
  CommentHeader, 
  CommentContent, 
  CommentActions, 
  UserName,
  CommentDate,
  CommentText
} from './styles';

interface CommentProps {
  comment: CommentType;
  currentUserId?: string;
  userRole?: UserRole;
  onReply?: (parentCommentId: string) => void;
  onDelete?: (commentId: string) => void;
  // Editing functionality disabled
  // onEdit?: (commentId: string, newContent: string) => void;
  // isEditing?: boolean;
  // onEditStart?: () => void;
  // onEditCancel?: () => void;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  currentUserId,
  userRole = 'viewer',
  onReply,
  onDelete
  // Editing functionality disabled
  // onEdit,
  // isEditing = false,
  // onEditStart,
  // onEditCancel
}) => {
  // const [editContent, setEditContent] = useState(comment.content); // Disabled
  const [replyContent, setReplyContent] = useState('');

  // const canEdit = canEditComment(userRole, comment.user_id, currentUserId || ''); // Disabled
  // const canDelete = canDeleteComment(userRole, comment.user_id, currentUserId || '');
  // const canReply = ['editor', 'admin', 'owner'].includes(userRole);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Editing functionality disabled
  // const handleEdit = () => {
  //   if (onEdit && editContent.trim()) {
  //     onEdit(comment.id, editContent.trim());
  //   }
  // };

  // const handleDelete = () => {
  //   if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
  //     onDelete(comment.id);
  //   }
  // };

  // const handleReply = () => {
  //   if (onReply && replyContent.trim()) {
  //     onReply(comment.id);
  //     setReplyContent('');
  //     setShowReplyForm(false);
  //   }
  // };

  const getUserDisplayName = () => {
    if (comment.User) {
      return `${comment.User.firstname || ''} ${comment.User.lastname || ''}`.trim() || 
             comment.User.username || 
             comment.User.email;
    }
    return 'Unknown User';
  };

  return (
    <CommentContainer>
      <CommentHeader>
        <UserName>{getUserDisplayName()}</UserName>
        <CommentDate>
          {formatDate(comment.created_at)}
          {comment.is_edited && ' (edited)'}
        </CommentDate>
      </CommentHeader>

      <CommentContent>
        <CommentText>{comment.content}</CommentText>
      </CommentContent>

      <CommentActions>
        {/* Reply and Delete functionality disabled */}
        {/* {canReply && (
          <ReplyButton onClick={() => setShowReplyForm(!showReplyForm)}>
            Reply
          </ReplyButton>
        )}
        {canDelete && (
          <DeleteButton onClick={handleDelete}>
            Delete
          </DeleteButton>
        )} */}
      </CommentActions>

      {/* Reply form disabled */}
      {/* {showReplyForm && (
        <CommentForm>
          <CommentInput
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={3}
          />
          <CommentButtons>
            <button onClick={handleReply} disabled={!replyContent.trim()}>
              Reply
            </button>
            <button onClick={() => setShowReplyForm(false)}>
              Cancel
            </button>
          </CommentButtons>
        </CommentForm>
      )} */}
    </CommentContainer>
  );
};

export default Comment;
