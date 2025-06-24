import React, { useState, useEffect, useRef } from 'react';
import { FaRegHeart, FaHeart, FaCommentDots, FaTimes, FaShareAlt } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * PostViewerModal Component
 *
 * This modal displays a single post with its image, caption, likes, and comments.
 * It provides interactive elements for liking and commenting on the post.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to call when the modal needs to be closed.
 * @param {object} props.post - The post object to display, containing id, url, caption, likes, and comments.
 * @param {function} props.onLikePost - Callback function when the like button is clicked.
 * Receives the post ID as an argument.
 */
const PostViewerModal = ({ isOpen, onClose, post, onLikePost }) => {
    // State to manage the like status of the current post
    // This is a local UI state. The actual data update should happen via onLikePost.
    const [isLiked, setIsLiked] = useState(false);
    // Ref for the comments section to enable auto-scrolling to the bottom
    const commentsRef = useRef(null);

    // Effect to reset like status and scroll comments when a new post is opened
    useEffect(() => {
        if (isOpen && post) {
            // Simulate initial like status based on current post's likes (adjust as needed for real logic)
            // In a real application, you would check if the current user has liked this specific post.
            setIsLiked(post.likes > 20); // Example: if post has > 20 likes, assume it's liked
            // Scroll to the bottom of the comments section
            if (commentsRef.current) {
                commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
            }
        }
    }, [isOpen, post]); // Dependencies: isOpen (when modal opens/closes) and post (when a new post is selected)

    // If the modal is not open or no post data is provided, return null to render nothing
    // AnimatePresence handles the exit animation when `isOpen` becomes false.
    if (!post) {
        console.warn("PostViewerModal received invalid post data.");
        return null;
    }

    // Handler for liking/unliking the post
    const handleLikeClick = () => {
        // Optimistically update the local UI state
        setIsLiked(!isLiked);
        // Call the parent component's handler to update the actual data (e.g., in ProfilePage state or backend)
        onLikePost(post.id);
    };

    // Framer Motion variants for backdrop animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    // Framer Motion variants for modal content animation
    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
        exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
    };

    return (
        // AnimatePresence enables exit animations for components that are removed from the DOM
        <AnimatePresence>
            {isOpen && ( // Only render the modal content if `isOpen` is true
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 sm:p-6 backdrop-blur-sm font-inter"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose} // Close modal when clicking on the backdrop
                >
                    <motion.div
                        className="relative bg-white rounded-3xl shadow-3xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform-gpu"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 z-50 bg-white rounded-full p-2.5 transition-all duration-300 shadow-lg hover:scale-110"
                            title="Close post viewer"
                        >
                            <FaTimes size={22} />
                        </button>

                        <div className="flex flex-1 flex-col md:flex-row">
                            {/* Post Image Display Area */}
                            <div className="relative flex-1 bg-gray-950 flex items-center justify-center p-3 sm:p-5">
                                <img
                                    src={post.url}
                                    alt={post.caption || "Post image"}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                                />
                            </div>

                            {/* Post Details & Actions Sidebar */}
                            <motion.div
                                className={`w-full md:w-96 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col relative`}
                            >
                                <h3 className="font-bold text-2xl text-gray-900 mb-3 leading-tight">{post.caption || "No Caption"}</h3>
                                <div className="flex items-center gap-4 mb-5">
                                    {/* Like Button */}
                                    <button
                                        onClick={handleLikeClick}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${isLiked ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600'}`}
                                    >
                                        {/* Display the correct heart icon based on `isLiked` state */}
                                        {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                                        {/* Display like count, incremented/decremented locally based on `isLiked` */}
                                        {post.likes + (isLiked ? 1 : 0)}
                                    </button>
                                    {/* Comments Button (for visual only, no functionality here) */}
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                                        <FaCommentDots size={18} /> {post.comments.length}
                                    </button>
                                    {/* Share Button (for visual only, no functionality here) */}
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                                        <FaShareAlt size={18} /> Share
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="flex-grow min-h-0 overflow-hidden">
                                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Comments ({post.comments.length})</h4>
                                    <div ref={commentsRef} className="space-y-3 max-h-[calc(100%-80px)] overflow-y-auto pr-2 custom-scrollbar">
                                        {post.comments.length > 0 ? (
                                            post.comments.map((comment, index) => (
                                                <motion.div
                                                    key={index} // Using index as key is okay if comments don't change order or get deleted/added mid-list
                                                    className="text-sm text-gray-800 bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-200"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                >
                                                    <span className="font-semibold text-primary-700">User{index + 1}: </span>{comment}
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-md text-gray-500 italic p-3 bg-gray-100 rounded-lg">Be the first to leave a comment!</p>
                                        )}
                                    </div>
                                    {/* Add Comment Input (simplified, no actual functionality) */}
                                    <div className="mt-4">
                                        <textarea
                                            placeholder="Add a comment..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm resize-none"
                                            rows="2"
                                        ></textarea>
                                        <button className="mt-2 w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md">
                                            Post Comment
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
