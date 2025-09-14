import React, { useState, useEffect } from 'react';
import { Comment as CommentType, commentService } from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { canComment, UserRole } from '../../utils/permissions';
import Comment from '../Comment';
import { 
  CommentsContainer, 
  CommentsHeader, 
  CommentsList as CommentsListStyled,
  AddCommentForm,
  CommentInput,
  CommentButtons,
  NoCommentsMessage
} from './styles';

interface CommentsListProps {
  cardId: string;
  userRole?: UserRole;
}

const CommentsList: React.FC<CommentsListProps> = ({ cardId, userRole = 'viewer' }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [editingCommentId, setEditingCommentId] = useState<string | null>(null); // Disabled

  const userCanComment = canComment(userRole);

  // Load comments when component mounts
  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  // Listen for real-time comment updates
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = (comment: CommentType) => {
      if (comment.card_id === cardId) {
        setComments(prev => [...prev, comment]);
      }
    };

    // Comment update functionality has been disabled
    // const handleCommentUpdated = (updatedComment: CommentType) => {
    //   // Comment updates are not supported
    // };

    const handleCommentDeleted = (data: { commentId: string }) => {
      setComments(prev => prev.filter(comment => comment.id !== data.commentId));
    };

    socket.on('comment:added', handleCommentAdded);
    // socket.on('comment:updated', handleCommentUpdated); // Disabled
    socket.on('comment:deleted', handleCommentDeleted);

    return () => {
      socket.off('comment:added', handleCommentAdded);
      // socket.off('comment:updated', handleCommentUpdated); // Disabled
      socket.off('comment:deleted', handleCommentDeleted);
    };
  }, [socket, cardId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await commentService.getComments(cardId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !userCanComment) return;

    try {
      await commentService.addComment(cardId, {
        content: newComment.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Comment update functionality has been disabled
  // const handleEditComment = async (commentId: string, newContent: string) => {
  //   console.log('Comment update feature is not available');
  // };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = async (parentCommentId: string) => {
    if (!newComment.trim() || !userCanComment) return;

    try {
      await commentService.addComment(cardId, {
        content: newComment.trim(),
        parentCommentId
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddComment();
    }
  };

  return (
    <CommentsContainer>
      <CommentsHeader>
        <h4>Comments ({comments.length})</h4>
      </CommentsHeader>

      {userCanComment && (
        <AddCommentForm>
          <CommentInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment... (Ctrl+Enter to send)"
            rows={3}
          />
          <CommentButtons>
            <button 
              onClick={handleAddComment} 
              disabled={!newComment.trim()}
            >
              Add Comment
            </button>
          </CommentButtons>
        </AddCommentForm>
      )}

      <CommentsListStyled>
        {isLoading ? (
          <div>Loading comments...</div>
        ) : comments.length === 0 ? (
          <NoCommentsMessage>
            No comments yet. Be the first to comment!
          </NoCommentsMessage>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              userRole={userRole}
              onReply={handleReply}
              onDelete={handleDeleteComment}
              // Editing functionality disabled
              // onEdit={handleEditComment}
              // isEditing={editingCommentId === comment.id}
              // onEditStart={() => setEditingCommentId(comment.id)}
              // onEditCancel={() => setEditingCommentId(null)}
            />
          ))
        )}
      </CommentsListStyled>
    </CommentsContainer>
  );
};

export default CommentsList;
