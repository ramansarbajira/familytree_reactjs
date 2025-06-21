import React, { useState, useEffect, useRef } from 'react';
import { FaRegHeart, FaHeart, FaCommentDots, FaTimes, FaChevronLeft, FaChevronRight, FaInfoCircle, FaShareAlt } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

const GalleryViewerModal = ({ isOpen, onClose, album, onLikePhoto }) => {
    // All hooks must be declared unconditionally at the top level
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showInfo, setShowInfo] = useState(false); // This state is not currently used but kept for potential future expansion
    const commentsRef = useRef(null);

    // Reset photo index, like state, and info state when album changes or modal opens
    // This effect will run every time isOpen or album changes, but its logic only acts if isOpen is true.
    useEffect(() => {
        if (isOpen) {
            setCurrentPhotoIndex(0);
            setIsLiked(false); // Reset like state for the new photo
            // Ensure `currentPhoto` exists before trying to access its properties
            if (album && album.photos && album.photos[0]) {
                // Simplified like check, integrate with your actual user liking logic
                setIsLiked(album.photos[0].likes > 20); // Example: if initial photo has many likes, assume it's liked
            }
        }
    }, [isOpen, album]);

    // Handle initial like status for the currently viewed photo when currentPhotoIndex changes
    useEffect(() => {
        if (album && album.photos[currentPhotoIndex]) {
            // This is a simplified check. In a real app, you'd check if currentUser.id is in a list of photo.likedBy array.
            // For now, we'll just simulate a toggle or a random like state.
            setIsLiked(album.photos[currentPhotoIndex].likes > 20); // Example: if photo has > 20 likes, mark as liked
        }
    }, [currentPhotoIndex, album]); // Depend on currentPhotoIndex to update like state per photo

    // Scroll comments to bottom when they are loaded or updated (if new comments added)
    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    }, [currentPhotoIndex, album]); // Re-scroll when the active photo (and thus its comments) changes

    // IMPORTANT: Remove the early return statement here.
    // The parent component (`FamilyGalleryPage`) is responsible for conditionally rendering this modal.
    // We can add a fallback check for `album` just in case, but it shouldn't be the primary conditional render.
    if (!album || !album.photos || album.photos.length === 0) {
        // This case indicates an issue with the parent's data supply or selection.
        // It's generally better to prevent rendering the modal at all from the parent
        // if album data is invalid. Returning null here as a safety fallback.
        console.warn("GalleryViewerModal received invalid album data.");
        return null;
    }

    const currentPhoto = album.photos[currentPhotoIndex];

    const goToNextPhoto = () => {
        setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % album.photos.length);
    };

    const goToPrevPhoto = () => {
        setCurrentPhotoIndex((prevIndex) =>
            (prevIndex - 1 + album.photos.length) % album.photos.length
        );
    };

    const handleLikeClick = () => {
        // Toggle the liked state locally for immediate feedback
        setIsLiked(!isLiked);
        // Call the parent handler to update global state (or backend)
        onLikePhoto(album.id, currentPhoto.id);
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
        // AnimatePresence should wrap the component that is conditionally rendered
        // The `isOpen` prop passed to AnimatePresence ensures the exit animation plays when `isOpen` becomes false.
        <AnimatePresence>
            {isOpen && ( // Keep this `isOpen` check here to trigger Framer Motion's exit animation
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 p-4 sm:p-6 backdrop-blur-sm"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={onClose} // Close when clicking outside
                >
                    <motion.div
                        className="relative bg-white rounded-3xl shadow-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden transform-gpu"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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

                            {/* Photo Details & Actions Sidebar */}
                            <motion.div
                                className={`w-full md:w-96 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col relative`}
                            >
                                <h3 className="font-bold text-2xl text-gray-900 mb-3 leading-tight">{currentPhoto.caption || "No Caption"}</h3>
                                <div className="flex items-center gap-4 mb-5">
                                    <button
                                        onClick={handleLikeClick}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-300 ${isLiked ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600'}`}
                                    >
                                        {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />} {currentPhoto.likes + (isLiked ? 1 : 0)}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                                        <FaCommentDots size={18} /> {currentPhoto.comments.length}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                                        <FaShareAlt size={18} /> Share
                                    </button>
                                </div>

                                {/* Comments Section */}
                                <div className="flex-grow min-h-0 overflow-hidden">
                                    <h4 className="font-semibold text-lg text-gray-800 mb-3">Comments ({currentPhoto.comments.length})</h4>
                                    <div ref={commentsRef} className="space-y-3 max-h-[calc(100%-80px)] overflow-y-auto pr-2 custom-scrollbar">
                                        {currentPhoto.comments.length > 0 ? (
                                            currentPhoto.comments.map((comment, index) => (
                                                <motion.div
                                                    key={index}
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
                                    {/* Add Comment Input (simplified) */}
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