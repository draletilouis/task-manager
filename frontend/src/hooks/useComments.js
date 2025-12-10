import { useState, useEffect } from 'react';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment
} from '../api/comments';

export const useComments = (taskId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch comments for task
  const fetchComments = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const data = await getComments(taskId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when taskId changes
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  // Create new comment
  const addComment = async (commentData) => {
    try {
      const newComment = await createComment(taskId, commentData);
      setComments([...comments, newComment]);
      return newComment;
    } catch (err) {
      throw new Error(err.message || 'Failed to create comment');
    }
  };

  // Update existing comment
  const editComment = async (commentId, commentData) => {
    try {
      const updated = await updateComment(taskId, commentId, commentData);
      setComments(comments.map(c => c.id === commentId ? updated : c));
      return updated;
    } catch (err) {
      throw new Error(err.message || 'Failed to update comment');
    }
  };

  // Delete comment
  const removeComment = async (commentId) => {
    try {
      await deleteComment(taskId, commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      throw new Error(err.message || 'Failed to delete comment');
    }
  };

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
    editComment,
    removeComment,
  };
};
