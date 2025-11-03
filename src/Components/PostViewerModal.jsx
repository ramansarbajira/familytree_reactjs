import React, { useState, useEffect, useRef } from "react";
import { FaRegHeart, FaHeart, FaCommentDots, FaTimes } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const PostViewerModal = ({ isOpen, onClose, post, onLikePost, authToken }) => {
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [isLiked, setIsLiked] = useState(post?.isLiked || false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const commentsRef = useRef(null);

  useEffect(() => {
    if (isOpen && post) {
      setIsLiked(post.isLiked);
      setLikeCount(post.likes);
      fetchComments();
    }
  }, [isOpen, post]);

   const fetchComments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${post.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const data = await response.json();
      if (data?.comments) {
        setComments(data.comments);
        setTimeout(() => {
          if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleLikeClick = async () => {
    setIsLikeLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${post.id}/like-toggle`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsLiked(data.liked);
        setLikeCount(data.totalLikes);
      } else {
        console.error("Failed to toggle like:", data.message || response.statusText);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
    setTimeout(() => setIsLikeLoading(false), 2000);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsCommentLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/post/${post.id}/comment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: newComment.trim() }),
        }
      );

      if (response.ok) {
        setNewComment("");
        await fetchComments();
      } else {
        const errorData = await response.json();
        console.error("Failed to post comment:", errorData.message || response.statusText);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
    setIsCommentLoading(false);
  };

  if (!post) return null;

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 sm:p-6 backdrop-blur-sm font-inter"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-3xl shadow-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform-gpu"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 z-50 bg-white rounded-full p-2.5 transition-all duration-300 shadow-lg hover:scale-110"
              title="Close post viewer"
            >
              <FaTimes size={22} />
            </button>

            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
              {/* Left image section */}
              <div className="relative flex-1 bg-gray-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
                {post.url || post.fullImageUrl ? (
                  <img
                    src={post.url || post.fullImageUrl}
                    alt={post.caption || "Post image"}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-white text-center text-lg italic">
                    No image available for this post.
                  </div>
                )}
              </div>

              {/* Right content & comments */}
              <motion.div className="w-full md:w-96 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col relative">
                {/* Caption / Post Content */}
                <div
                  className="text-gray-900 mb-3 leading-relaxed overflow-auto max-h-[15vh] md:max-h-[18vh] pr-2"
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    whiteSpace: "pre-wrap",
                  }}
                  title={post.caption}
                >
                  {post.caption || "No Caption"}
                </div>

                {/* Like & Comment buttons */}
                <div className="flex items-center gap-4 mb-5 flex-shrink-0">
                  <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                      isLiked
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
                    }`}
                    disabled={isLikeLoading}
                  >
                    {isLikeLoading ? (
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : isLiked ? (
                      <FaHeart size={18} />
                    ) : (
                      <FaRegHeart size={18} />
                    )}{" "}
                    {likeCount}
                  </button>

                  <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                    <FaCommentDots size={18} /> {comments.length}
                  </button>
                </div>

                {/* Comments section */}
                <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
                  <h4 className="font-semibold text-lg text-gray-800 mb-3 flex-shrink-0">
                    Comments ({comments.length})
                  </h4>

                  <div
                    ref={commentsRef}
                    className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow"
                    style={{ maxHeight: "calc(100% - 110px)" }} // leave space for textarea + buttons
                  >
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          className="flex gap-3 items-start text-sm text-gray-800 bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Show profile image if available, else fallback */}
                          {comment.user?.profile ? (
                            <img
                              src={comment.user.profile}
                              alt="Profile"
                              className="w-8 h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
                              {comment.user?.firstName?.[0]?.toUpperCase() ||
                                "?"}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="font-semibold text-primary-700">
                              {comment.user?.firstName} {comment.user?.lastName}
                            </div>
                            <div>{comment.content}</div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-md text-gray-500 italic p-3 bg-gray-100 rounded-lg">
                        Be the first to leave a comment!
                      </p>
                    )}
                  </div>

                  {/* New comment input */}
                  <div className="mt-4 flex flex-col flex-shrink-0">
                    <textarea
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm resize-none"
                      rows="2"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handlePostComment}
                      disabled={!newComment.trim() || isCommentLoading}
                      className={`mt-2 w-full py-2 rounded-lg font-semibold transition-colors shadow-md ${
                        isCommentLoading
                          ? "bg-gray-400"
                          : "bg-primary-600 hover:bg-primary-700 text-white"
                      }`}
                    >
                      {isCommentLoading ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostViewerModal;
