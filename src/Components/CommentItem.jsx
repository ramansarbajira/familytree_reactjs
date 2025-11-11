import React, { useState } from 'react';
import { FaEdit, FaTrash, FaReply, FaSave, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CommentItem = ({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReply,
  depth = 0,
  maxDepth = 3 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editText, setEditText] = useState(comment.comment || comment.content || '');
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setIsLoading(true);
    try {
      await onEdit(comment.id, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment and all its replies?')) return;
    setIsLoading(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setIsLoading(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const user = comment.user || {};
  const fullName = `${user.firstName || 'Unknown'} ${user.lastName || ''}`.trim();
  const profileUrl = user.profile || '/assets/user.png';
  const commentText = comment.comment || comment.content || '';

  return (
    <motion.div
      className={`flex gap-3 items-start ${depth > 0 ? 'ml-8 mt-2' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <img
        src={profileUrl}
        alt={fullName}
        className="w-9 h-9 rounded-full object-cover border border-gray-300 flex-shrink-0"
      />

      {/* Comment Content */}
      <div className="flex-1">
        <div className={`${isLoading ? 'opacity-50' : ''}`}>
          {/* Comment Text or Edit Mode */}
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 text-sm resize-none"
                rows="2"
                disabled={isLoading}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  disabled={isLoading || !editText.trim()}
                  className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(commentText);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[13px]">
                <span className="font-semibold text-gray-900 mr-2">{fullName}</span>
                <span className="text-gray-700">{commentText}</span>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {comment.updatedAt && 
                 new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000 && (
                  <span className="ml-1 italic">(edited)</span>
                )}
              </div>
            </>
          )}

          {/* Action Buttons - Instagram Style */}
          {!isEditing && (
            <div className="flex gap-4 mt-2 text-[12px] text-gray-500">
              {canReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  disabled={isLoading}
                  className="font-medium hover:text-gray-700 bg-transparent"
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    className="font-medium hover:text-gray-700 bg-transparent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="font-medium text-red-500 hover:text-red-700 bg-transparent"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <div className="mt-2 ml-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 text-sm resize-none"
              rows="2"
              disabled={isLoading}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReply}
                disabled={isLoading || !replyText.trim()}
                className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg text-xs hover:bg-primary-700 disabled:opacity-50"
              >
                <FaReply size={12} /> Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs hover:bg-gray-400"
              >
                <FaTimes size={12} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onDelete={onDelete}
                onReply={onReply}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;
