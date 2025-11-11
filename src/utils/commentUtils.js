/**
 * Build a nested comment tree from flat array
 * @param {Array} comments - Flat array of comments
 * @returns {Array} - Nested comment tree
 */
export const buildCommentTree = (comments) => {
  if (!Array.isArray(comments)) return [];

  const commentMap = new Map();
  const rootComments = [];

  // First pass: create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  // Second pass: build the tree structure
  comments.forEach(comment => {
    if (comment.parentCommentId) {
      // This is a reply, add it to parent's replies array
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies.push(commentMap.get(comment.id));
      } else {
        // Parent not found, treat as root comment
        rootComments.push(commentMap.get(comment.id));
      }
    } else {
      // This is a root comment
      rootComments.push(commentMap.get(comment.id));
    }
  });

  return rootComments;
};

/**
 * Flatten comment tree back to array
 * @param {Array} commentTree - Nested comment tree
 * @returns {Array} - Flat array of comments
 */
export const flattenCommentTree = (commentTree) => {
  const result = [];
  
  const flatten = (comments) => {
    comments.forEach(comment => {
      const { replies, ...commentData } = comment;
      result.push(commentData);
      if (replies && replies.length > 0) {
        flatten(replies);
      }
    });
  };
  
  flatten(commentTree);
  return result;
};

/**
 * Count total comments including replies
 * @param {Array} commentTree - Nested comment tree
 * @returns {number} - Total comment count
 */
export const countComments = (commentTree) => {
  let count = 0;
  
  const countRecursive = (comments) => {
    comments.forEach(comment => {
      count++;
      if (comment.replies && comment.replies.length > 0) {
        countRecursive(comment.replies);
      }
    });
  };
  
  countRecursive(commentTree);
  return count;
};
