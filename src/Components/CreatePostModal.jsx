import React, { useState, useRef, useEffect } from 'react';
import {
    FiX, FiImage, FiVideo, FiSend,
    FiChevronDown, FiSmile, FiTrash2, FiEdit3, FiCheckCircle
} from 'react-icons/fi';
import { FaGlobeAmericas, FaUserFriends } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { useUser } from '../Contexts/UserContext';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, currentUser, authToken, mode = 'create', postData = null }) => {
    const { userInfo } = useUser();
    // State for form fields
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Used for new image file previews
    const [currentPostImageUrl, setCurrentPostImageUrl] = useState(null); // Used for existing post image
    const [privacy, setPrivacy] = useState('public'); // Default to 'public' as the privacy type
    const [familyCode, setFamilyCode] = useState(''); // Added for family privacy

    // UI/logic states
    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
    const [message, setMessage] = useState(''); // State for displaying messages to the user
    const [showSuccess, setShowSuccess] = useState(false); // NEW: Success popup state

    // Refs for click outside functionality and input focus
    const modalRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const privacyDropdownRef = useRef(null);
    const emojiPickerRef = useRef(null);

    // Effect to initialize form fields when modal opens or mode/postData changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && postData) {
                // Pre-fill form for editing
                setContent(postData.caption || '');
                // Ensure the privacy value from postData is handled gracefully if it's not 'family' or 'public'
                setPrivacy(postData.privacy === 'private' ? 'family' : postData.privacy || 'family'); // Map 'private' to 'family' for consistency
                setFamilyCode(postData.familyCode || '');
                setCurrentPostImageUrl(postData.url || null); // Set existing image URL
                setImageFile(null); // Clear any previously selected new file
                setImagePreview(null); // Clear new file preview
            } else { // 'create' mode
                // Reset form for new post
                setContent('');
                // Check if user has family code and is approved to show private option
                const hasFamilyCode = currentUser?.familyCode && currentUser.familyCode.trim() !== '';
                const isApproved = userInfo?.approveStatus === 'approved';
                const canUsePrivate = hasFamilyCode && isApproved;
                
                setPrivacy('public'); // Default to public posts
                setFamilyCode(currentUser?.familyCode || userInfo?.familyCode || ''); // Pre-fill with user's family code if available
                setImageFile(null);
                setImagePreview(null);
                setCurrentPostImageUrl(null);
            }
            setMessage(''); // Clear messages on open
            setShowEmojiPicker(false); // Ensure emoji picker is closed
            setShowPrivacyDropdown(false); // Ensure privacy dropdown is closed
            setShowSuccess(false); // NEW: Reset success popup
        }
    }, [isOpen, mode, postData, currentUser, userInfo]);

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

    // Only render the modal if it's open AND currentUser/authToken is defined
    if (!isOpen || !currentUser || !authToken) {
        return null;
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Set preview for the new file
            setMessage(''); // Clear any previous messages
        } else {
            setImageFile(null);
            setImagePreview(null);
            setMessage('Please select a valid image file.');
        }
        setShowEmojiPicker(false); // Close emoji picker when image is added
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
        setMessage(''); // Clear previous messages

        if (!content.trim() && !imageFile && !currentPostImageUrl) { // Check for existing image too
            setMessage("Please add some content or an image to your post.");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('caption', content.trim());
        formData.append('privacy', privacy === 'family' ? 'private' : privacy); // Map 'family' to 'private' for backend
        formData.append('status', '1'); 
        // Only append familyCode if privacy is family (private)
        formData.append('familyCode', privacy === 'family' ? familyCode : '');

        if (imageFile) {
            formData.append('postImage', imageFile); // Only append if a new file is selected
        }
        // If it's an edit and no new image, don't append postImage. Backend should retain existing.

        let url = `${import.meta.env.VITE_API_BASE_URL}/post`;
        let method = 'POST';

        if (mode === 'edit' && postData?.id) {
            url = `${import.meta.env.VITE_API_BASE_URL}/post/edit/${postData.id}`;
            method = 'PUT'; // Use PUT for updating an existing resource
        } else if (mode === 'create') {
            url = `${import.meta.env.VITE_API_BASE_URL}/post/create`;
            method = 'POST';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    // 'Content-Type': 'multipart/form-data' is typically not set manually for FormData
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${mode} post`);
            }

            // const responseData = await response.json(); // If you need response data

            // NEW: Show success popup instead of message
            console.log('🔍 Setting showSuccess to true');
            setShowSuccess(true);
            console.log('🔍 Success popup should now be visible');
            onPostCreated(); // Notify parent component to re-fetch posts 

        } catch (error) {
            console.error(`Error ${mode}ing post:`, error);
            setMessage(`Error: ${error.message || `Could not ${mode} post.`}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setContent('');
        setImageFile(null);
        setImagePreview(null);
        setCurrentPostImageUrl(null);
        // Check if user can use private option for default
        const hasFamilyCode = currentUser?.familyCode && currentUser.familyCode.trim() !== '';
        const isApproved = userInfo?.approveStatus === 'approved';
        const canUsePrivate = hasFamilyCode && isApproved;
        setPrivacy(canUsePrivate ? 'family' : 'public'); // Reset based on user's family status
        setFamilyCode(currentUser?.familyCode || userInfo?.familyCode || ''); // Reset to user's family code
        setIsLoading(false);
        setShowEmojiPicker(false);
        setShowPrivacyDropdown(false);
        setMessage('');
        setShowSuccess(false); // NEW: Reset success popup
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
        setShowEmojiPicker(false); // Close emoji picker when file dialog opens
    };

    const removeImage = () => {
        setImagePreview(null); // Clear new image preview
        setImageFile(null); // Clear new image file
        setCurrentPostImageUrl(null); // Clear existing image
        setMessage(''); // Clear any previous messages
    };

    // Check if user can use private option
    const hasFamilyCode = (currentUser?.familyCode || userInfo?.familyCode) && (currentUser?.familyCode || userInfo?.familyCode).trim() !== '';
    const isApproved = userInfo?.approveStatus === 'approved';
    const canUsePrivate = hasFamilyCode && isApproved;

    // Options for the custom privacy selector
    const PrivacyOptions = {
        family: { icon: <FaUserFriends className="mr-1.5" />, label: "Private", color: "text-primary-600" },
        public: { icon: <FaGlobeAmericas className="mr-1.5" />, label: "Public", color: "text-green-600" }
    };

    // Filter options based on user's family status
    const availablePrivacyOptions = canUsePrivate 
        ? PrivacyOptions 
        : { public: PrivacyOptions.public };

    // Ensure privacy always maps to a valid key in PrivacyOptions
    const currentPrivacyOption = PrivacyOptions[privacy] || PrivacyOptions['public']; 

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 overflow-hidden">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100
                   max-h-[90vh] overflow-hidden flex flex-col relative"
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from propagating to close modal
            >
                {/* NEW: Success Popup */}
                {showSuccess && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50 p-6 text-center">
                        <div className="border-4 border-green-500 rounded-2xl p-8 bg-white shadow-lg max-w-md w-full">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <FiCheckCircle size={40} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Success!</h3>
                            <p className="text-gray-600 mb-6 text-lg">Post created successfully.</p>
                            <button
                                className="bg-green-600 text-white px-8 py-2 rounded-full font-semibold text-lg shadow hover:bg-green-700 transition"
                                onClick={() => {
                                    console.log('🔍 OK button clicked');
                                    setShowSuccess(false);
                                    handleClose();
                                }}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
                {console.log('🔍 showSuccess state:', showSuccess)}
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{mode === 'create' ? 'Create New Post' : 'Edit Post'}</h2>
                    <button
                        onClick={handleClose}
                        className="bg-unset text-black-500 p-1.5 rounded-full transition-colors"
                        title="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-grow">
                    {/* Author Info */}
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser.profileUrl}
                            alt="Your Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                        />
                        <div>
                            <p className="font-medium text-gray-800">{currentUser.firstName}</p>
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
                                            {Object.entries(availablePrivacyOptions).map(([value, { icon, label, color }]) => (
                                                <button
                                                    key={value}
                                                    type="button" // Important for buttons inside a form but not submitting
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
                            placeholder={`What's on your mind, ${currentUser.firstName?.split('_')[0] || 'Family Member'}?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
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

                    {/* Family Code Input - Hidden but still used in payload */}
                    <input
                        type="hidden"
                        id="familyCode"
                        value={familyCode}
                    />

                    {/* Message Display (replaces alert) */}
                    {message && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{message}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setMessage('')}>
                                <FiX size={18} />
                            </span>
                        </div>
                    )}

                    {/* Image Preview */}
                    {(imagePreview || currentPostImageUrl) && (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                                src={imagePreview || currentPostImageUrl} // Prioritize new preview, then existing image
                                alt="Post Preview"
                                className="w-full max-h-80 object-contain bg-gray-100"
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
                                        e.stopPropagation();
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
                                disabled={isLoading || (!content.trim() && !imageFile && !currentPostImageUrl)}
                                className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-1 ${
                                    (content.trim() || imageFile || currentPostImageUrl)
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
                                        <span>{mode === 'create' ? 'Posting...' : 'Updating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSend size={16} />
                                        <span>{mode === 'create' ? 'Post' : 'Update'}</span>
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
