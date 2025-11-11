import React, { useState, useEffect, useRef } from 'react';
import { FaRegHeart, FaHeart, FaCommentDots, FaTimes, FaChevronLeft, FaChevronRight, FaInfoCircle, FaShareAlt } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import CommentItem from './CommentItem';
import { buildCommentTree, countComments } from '../utils/commentUtils';

const GalleryViewerModal = ({ isOpen, onClose, album, currentUser, authToken }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(album?.isLiked || false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [totalLikes, setTotalLikes] = useState(album?.likes || 0);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [comments, setComments] = useState([]);
    const commentsRef = useRef(null);
    const [commentTotal, setCommentTotal] = useState(0);
    

    // This effect handles resetting the photo index when the modal opens or the album changes
    useEffect(() => {
        if (isOpen) {
            setCurrentPhotoIndex(0);
        }
    }, [isOpen, album]);

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    }, [currentPhotoIndex, album]);

    useEffect(() => {
        if (album) {
            setIsLiked(album.isLiked);
            setTotalLikes(album.likes);
            fetchComments();
        }
    }, [album]);

    if (!album || !album.photos || album.photos.length === 0) {
        console.warn("GalleryViewerModal received invalid album data or empty photos array.");
        return null;
    }

    const currentPhoto = album.photos[currentPhotoIndex];

    const toggleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ galleryId: album.id })
            });

            const data = await response.json();
            console.log('Response from API:', data);

            setIsLiked(Boolean(data.liked));
            
            if (typeof data.totalLikes === 'number') {
                setTotalLikes(data.totalLikes);
            }
        } catch (error) {
            console.error("Failed to toggle like:", error);
        } finally {
            setLikeLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/${album.id}/comments`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            if (Array.isArray(data.comments)) {
                setComments(data.comments);
                setCommentTotal(data.total || data.comments.length); // set total properly
            } else {
                console.warn("Unexpected comment format:", data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        setCommentLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/comment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    galleryId: album.id,
                    comments: newComment.trim()
                })
            });
            if (response.ok) {
                setNewComment("");
                await fetchComments();
            } else {
                console.warn("Unexpected comment response:", response);
            }
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setCommentLoading(false);
        }
    };

    const handleEditComment = async (commentId, newText) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/comment/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment: newText })
            });
            if (response.ok) {
                await fetchComments();
            }
        } catch (error) {
            console.error('Failed to edit comment:', error);
            throw error;
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/comment/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.ok) {
                await fetchComments();
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            throw error;
        }
    };

    const handleReplyComment = async (parentCommentId, replyText) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gallery/comment/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    galleryId: album.id,
                    parentCommentId,
                    comment: replyText
                })
            });
            if (response.ok) {
                await fetchComments();
            }
        } catch (error) {
            console.error('Failed to reply to comment:', error);
            throw error;
        }
    };

    const goToNextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % album.photos.length);
    };

    const goToPrevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            (prevIndex - 1 + album.photos.length) % album.photos.length
        );
    };

    // Framer Motion variants for animations
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
        exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }
    };

   


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 sm:p-6 backdrop-blur-sm"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose}
                >
                    <motion.div
                        className="relative bg-white rounded-3xl shadow-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden transform-gpu"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 z-50 bg-white rounded-full p-2.5 transition-all duration-300 shadow-lg hover:scale-110"
                            title="Close gallery"
                        >
                            <FaTimes size={22} />
                        </button>

                        <div className="flex flex-1 flex-col md:flex-row">
                            {/* Photo Display Area */}
                            <div className="relative flex-1 bg-gray-950 flex items-center justify-center p-3 sm:p-5">
                                <img
                                    src={currentPhoto.url}
                                    alt={currentPhoto.caption}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                                />
                                {/* Album Title Overlay */}
                                <div className="absolute top-0 left-0 p-4 text-white bg-gradient-to-b from-black/60 to-transparent w-full">
                                    <h2 className="text-xl font-semibold drop-shadow-md">{album.title}</h2>
                                    <p className="text-sm text-gray-200">by {album.author}</p>
                                </div>

                                {/* Navigation Arrows */}
                                {album.photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={goToPrevPhoto}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transform hover:scale-110"
                                            title="Previous photo"
                                        >
                                            <FaChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={goToNextPhoto}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transform hover:scale-110"
                                            title="Next photo"
                                        >
                                            <FaChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Album Details & Actions Sidebar */}
                            <motion.div
                                className={`w-full md:w-96 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col relative`}
                            >
                                <h3 className="font-bold text-2xl text-gray-900 mb-3 leading-tight">{album.title || "Gallery"}</h3>
                                <div className="flex items-center gap-4 mb-5">
                                    {/* Album Likes - simplified to show total */}
                                    <button
                                        onClick={toggleLike}
                                        disabled={likeLoading}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                                            isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'
                                        }`}
                                        title={isLiked ? 'Unlike' : 'Like'}
                                    >
                                        {likeLoading ? (
                                            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                        ) : (
                                            <>
                                                {isLiked ? <FaHeart size={18} className="text-red-600" /> : <FaRegHeart size={18} className="text-gray-600" />}
                                                {totalLikes}
                                            </>
                                        )}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                                        <FaCommentDots size={18} /> {comments.length}
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="flex-grow flex flex-col overflow-hidden">
                                    <h4 className="font-semibold text-lg text-gray-800 mb-3">
                                        Comments ({countComments(buildCommentTree(comments))})
                                    </h4>
                                    <div
                                        ref={commentsRef}
                                        className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
                                        style={{ maxHeight: '200px' }}
                                    >
                                        {comments.length > 0 ? (
                                            buildCommentTree(comments).map((comment) => (
                                                <CommentItem
                                                    key={comment.id}
                                                    comment={comment}
                                                    currentUserId={currentUser?.userId}
                                                    onEdit={handleEditComment}
                                                    onDelete={handleDeleteComment}
                                                    onReply={handleReplyComment}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-md text-gray-500 italic p-3 bg-gray-100 rounded-lg">
                                                No comments yet for this album. Be the first!
                                            </p>
                                        )}
                                    </div>
                                    {/* Add Comment Input */}
                                    <div className="mt-4">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment to the album..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm resize-none"
                                            rows="2"
                                        ></textarea>
                                        <button
                                            onClick={handlePostComment}
                                            disabled={commentLoading || !newComment.trim()}
                                            className={`mt-2 w-full py-2 rounded-lg font-semibold transition-colors shadow-md ${
                                                commentLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                        >
                                            {commentLoading ? 'Posting...' : 'Post Comment'}
                                        </button>
                                    </div>
                                </div>

                                {/* Photo Index Indicator */}
                                <div className="mt-auto pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
                                    Photo {currentPhotoIndex + 1} of {album.photos.length}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GalleryViewerModal;