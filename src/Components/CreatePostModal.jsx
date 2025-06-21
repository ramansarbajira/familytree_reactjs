import React, { useState, useRef, useEffect } from 'react';
import {
    FiX, FiImage, FiVideo, FiSend,
    FiChevronDown, FiSmile, FiTrash2
} from 'react-icons/fi';
import { FaGlobeAmericas, FaUserFriends } from 'react-icons/fa'; // Ensure these are imported
import EmojiPicker from 'emoji-picker-react';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser }) => {
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [privacy, setPrivacy] = useState('family'); // 'family' or 'public'
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);

    const modalRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const privacyDropdownRef = useRef(null);
    const emojiPickerRef = useRef(null); // Ref for the EmojiPicker container

    // Effect to close the main modal when clicking outside of it
    useEffect(() => {
        const handleClickOutsideModal = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutsideModal);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideModal);
        };
    }, [isOpen]);

    // Effect to close the custom privacy dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutsidePrivacy = (event) => {
            if (privacyDropdownRef.current && !privacyDropdownRef.current.contains(event.target)) {
                setShowPrivacyDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsidePrivacy);
        return () => document.removeEventListener('mousedown', handleClickOutsidePrivacy);
    }, []);

    // Effect to close the emoji picker when clicking outside of it
    useEffect(() => {
        const handleClickOutsideEmoji = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutsideEmoji);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideEmoji);
        };
    }, [showEmojiPicker]);


    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setShowEmojiPicker(false); // Close emoji picker when image is added
        }
    };

    const handleEmojiClick = (emojiData) => {
        const { emoji } = emojiData;
        const cursorPosition = textareaRef.current.selectionStart;
        const textBefore = content.substring(0, cursorPosition);
        const textAfter = content.substring(cursorPosition);

        setContent(textBefore + emoji + textAfter);

        setTimeout(() => {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(
                cursorPosition + emoji.length,
                cursorPosition + emoji.length
            );
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !imageFile) {
            alert("Please add some content or an image to your post.");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newPost = {
            id: Date.now(),
            author: currentUser.name,
            avatar: currentUser.avatar,
            time: "Just now",
            content: content.trim(),
            image: imagePreview, // Use imagePreview URL for the post display
            likes: 0,
            comments: 0,
            privacy: privacy,
            liked: false
        };

        onPostCreated(newPost);
        handleClose();
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setContent('');
        setImagePreview(null);
        setImageFile(null);
        setPrivacy('family');
        setIsLoading(false);
        setShowEmojiPicker(false);
        setShowPrivacyDropdown(false);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
        setShowEmojiPicker(false); // Close emoji picker when file dialog opens
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
    };

    // Options for the custom privacy selector
    const PrivacyOptions = {
        family: { icon: <FaUserFriends className="mr-1.5" />, label: "Family Only", color: "text-primary-600" },
        public: { icon: <FaGlobeAmericas className="mr-1.5" />, label: "Public", color: "text-green-600" }
    };

    const currentPrivacyOption = PrivacyOptions[privacy];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from propagating to close modal
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
                    <button
                        onClick={handleClose}
                        className="bg-unset text-black-500 p-1.5 rounded-full transition-colors"
                        title="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser.avatar}
                            alt="Your Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                        />
                        <div>
                            <p className="font-medium text-gray-800">{currentUser.name}</p>
                            {/* Custom Privacy Dropdown */}
                            <div className="relative" ref={privacyDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                                    className={`inline-flex justify-center items-center rounded-md border border-gray-200 shadow-sm px-3 py-1 bg-gray-50 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-colors ${currentPrivacyOption.color}`}
                                >
                                    {currentPrivacyOption.icon}
                                    {currentPrivacyOption.label}
                                    <FiChevronDown className="-mr-1 ml-1 h-4 w-4" aria-hidden="true" />
                                </button>

                                {showPrivacyDropdown && (
                                    <div className="origin-top-left absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                                        <div className="py-1">
                                            {Object.entries(PrivacyOptions).map(([value, { icon, label, color }]) => (
                                                <button
                                                    key={value}
                                                    onClick={() => {
                                                        setPrivacy(value);
                                                        setShowPrivacyDropdown(false);
                                                    }}
                                                    className={`bg-unset flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${color}`}
                                                >
                                                    {icon}
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Post Content Textarea */}
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-gray-800 placeholder-gray-400 resize-none min-h-[120px] transition-all"
                            placeholder={`What's on your mind, ${currentUser.name.split('_')[0]}?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            // Clicking on textarea will close emoji picker via emojiPickerRef useEffect
                            // onClick={() => setShowEmojiPicker(false)} // This can be removed, as the new useEffect handles it more broadly
                        ></textarea>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef} // Attach ref here
                                className="absolute top-full -mt-2 right-0 z-10 sm:right-auto sm:left-1/2 sm:-translate-x-1/2"
                            >
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    width={300}
                                    height={350}
                                    previewConfig={{ showPreview: false }}
                                    searchDisabled
                                    skinTonesDisabled
                                    lazyLoadEmojis
                                />
                            </div>
                        )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                                src={imagePreview}
                                alt="Post Preview"
                                className="w-full max-h-80 object-contain bg-gray-100"
                                // Clicking on image will close emoji picker via emojiPickerRef useEffect
                                // onClick={() => setShowEmojiPicker(false)} // This can be removed
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors flex items-center justify-center"
                                title="Remove image"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bg-primary-50/50 rounded-lg p-3 border border-primary-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Add to your post</p>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="flex space-x-1">
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="p-2 rounded-lg bg-white text-primary-600 hover:bg-primary-50 transition-colors shadow-sm flex items-center gap-1"
                                    title="Add photo"
                                >
                                    <FiImage size={18} />
                                    <span className="text-xs font-medium hidden sm:inline">Photo</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />

                                <button
                                    type="button"
                                    className="p-2 rounded-lg bg-white text-yellow-500 hover:bg-yellow-50 transition-colors shadow-sm flex items-center gap-1"
                                    title="Add emoji"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevents click from bubbling to modal/form background and closing picker
                                        setShowEmojiPicker(!showEmojiPicker);
                                    }}
                                >
                                    <FiSmile size={18} />
                                    <span className="text-xs font-medium hidden sm:inline">Emoji</span>
                                </button>

                                <button
                                    type="button"
                                    className="p-2 rounded-lg bg-white text-purple-500 hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1 opacity-50 cursor-not-allowed"
                                    title="Coming soon"
                                    disabled
                                >
                                    <FiVideo size={18} />
                                    <span className="text-xs font-medium hidden sm:inline">Video</span>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || (!content.trim() && !imageFile)}
                                className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-1 ${
                                    (content.trim() || imageFile)
                                        ? 'bg-primary-500 hover:bg-primary-600 shadow-md'
                                        : 'bg-gray-300 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={16} />
                                        <span>Post</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;