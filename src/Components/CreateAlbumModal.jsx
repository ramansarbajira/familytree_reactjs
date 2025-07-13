import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaUpload, FaImage, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Added FaPlus for new photo input
import Swal from 'sweetalert2';
import { useUser } from '../Contexts/UserContext';

const CreateAlbumModal = ({ isOpen, onClose, onCreateAlbum, currentUser, authToken, mode = 'create', albumData = null }) => {
    const { userInfo } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('family'); // Default to 'family'
    const [familyCode, setFamilyCode] = useState(''); // State for familyCode

    // For new file uploads
    const [coverPhotoFile, setCoverPhotoFile] = useState(null);
    const [galleryPhotoFiles, setGalleryPhotoFiles] = useState([]); // For new multiple gallery photos

    // For existing photos when in 'edit' mode
    const [currentCoverPhotoUrl, setCurrentCoverPhotoUrl] = useState(null);
    const [currentGalleryPhotos, setCurrentGalleryPhotos] = useState([]); // For existing multiple gallery photos (objects with id, url)

    const coverPhotoInputRef = useRef(null);
    const galleryPhotoInputRef = useRef(null);

    // Effect to initialize form fields when modal opens or mode/albumData changes
    useEffect(() => {
        if (isOpen) {
            if (mode === 'edit' && albumData) {
                setTitle(albumData.title || '');
                setDescription(albumData.description || '');
                // Map backend 'private' to local 'family' if necessary
                setPrivacy(albumData.privacy === 'private' ? 'family' : albumData.privacy || 'family');
                setFamilyCode(albumData.familyCode || '');

                // Set existing cover photo URL (assuming full URL from parent or construct here)
                setCurrentCoverPhotoUrl(albumData.coverPhotoUrl ? 
                                         albumData.coverPhotoUrl : null);
                
                // Set existing gallery photos (construct full URLs if necessary)
                const formattedExistingPhotos = albumData.galleryPhotos?.map(photo => ({
                    ...photo,
                    url: photo.url
                })) || [];
                setCurrentGalleryPhotos(formattedExistingPhotos);

                // Clear new file inputs when editing an existing album
                setCoverPhotoFile(null);
                setGalleryPhotoFiles([]);
                if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
                if (galleryPhotoInputRef.current) galleryPhotoInputRef.current.value = '';
            } else { // 'create' mode
                resetForm(); // Call reset to clear all states for a fresh form
                // Set default family code for new albums
                setFamilyCode(currentUser?.familyCode || userInfo?.familyCode || '');
                
                // Set privacy based on user approval status
                if (userInfo?.approveStatus === 'approved') {
                    setPrivacy('family'); // Allow private option
                } else {
                    setPrivacy('public'); // Only public option for non-approved users
                }
            }
        }
    }, [isOpen, mode, albumData, currentUser, userInfo]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrivacy('family');
        setFamilyCode('');
        setCoverPhotoFile(null);
        setGalleryPhotoFiles([]);
        setCurrentCoverPhotoUrl(null);
        setCurrentGalleryPhotos([]);
        if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
        if (galleryPhotoInputRef.current) galleryPhotoInputRef.current.value = '';
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCoverPhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCoverPhotoFile(e.target.files[0]);
            setCurrentCoverPhotoUrl(null); // Clear existing cover photo if new one is selected
        }
    };

    const handleRemoveCoverPhoto = () => {
        setCoverPhotoFile(null);
        setCurrentCoverPhotoUrl(null); // Remove both new preview and existing URL
        if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
    };

    const handleGalleryPhotosChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setGalleryPhotoFiles((prevFiles) => [...prevFiles, ...newFiles]);
            e.target.value = null; // Clear the input value so the same file(s) can be selected again
        }
    };

    const handleRemoveGalleryPhoto = (indexToRemove, isExisting = false) => {
        if (isExisting) {
            // For existing photos, filter them out locally.
            // A more robust solution would involve sending these IDs to the backend for deletion.
            setCurrentGalleryPhotos((prevPhotos) =>
                prevPhotos.filter((_, index) => index !== indexToRemove)
            );
            // Optionally, you might want to collect IDs of deleted existing photos to send to backend
            // For now, we are assuming backend update handles changes or needs separate delete calls.
        } else {
            // For newly selected files
            setGalleryPhotoFiles((prevFiles) =>
                prevFiles.filter((_, index) => index !== indexToRemove)
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Title',
                text: 'Album title is required!',
                confirmButtonColor: '#d33',
            });
            return;
        }

        if (privacy === 'family' && !familyCode.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Family Code',
                text: 'Family code is required for private albums. Please ensure you are part of a family.',
                confirmButtonColor: '#d33',
            });
            return;
        }


        const formData = new FormData();
        formData.append('galleryTitle', title);
        formData.append('galleryDescription', description || '');
        formData.append('privacy', privacy === 'family' ? 'private' : privacy); // Map 'family' to 'private' for backend
        formData.append('status', 1);
        formData.append('createdBy', currentUser?.userId || ''); // Ensure correct user ID prop
        
        // Only append familyCode when privacy is set to 'family' (private)
        if (privacy === 'family') {
            formData.append('familyCode', familyCode);
        }
        

        // Only append coverPhoto if a new file is selected
        if (coverPhotoFile) {
            formData.append('coverPhoto', coverPhotoFile);
        } 
        
        else if (mode === 'edit' && currentCoverPhotoUrl === null && albumData?.coverPhotoUrl) {
             formData.append('coverPhoto', ''); // Or a specific indicator your API understands for deletion
        }


        // Append newly added gallery photo files
        galleryPhotoFiles.forEach((file) => {
            formData.append('images', file); // key `images` must match backend for new files
        });

        let url = `${import.meta.env.VITE_API_BASE_URL}/gallery`;
        let method = 'POST';

        if (mode === 'edit' && albumData?.id) {
            url = `${import.meta.env.VITE_API_BASE_URL}/gallery/${albumData.id}`;
            method = 'PUT';
        } else if (mode === 'create') {
            url = `${import.meta.env.VITE_API_BASE_URL}/gallery/create`;
            method = 'POST';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result?.message || `Failed to ${mode} album`;
                throw new Error(errorMessage);
            }

            console.log(`Album ${mode === 'create' ? 'Created' : 'Updated'}:`, result);

            onCreateAlbum(result); // Notify parent to refresh listing
            handleClose(); // Close modal

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: `Album ${mode === 'create' ? 'created' : 'updated'} successfully.`,
                confirmButtonColor: '#3f982c',
            });

        } catch (err) {
            console.error(err);

            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: err.message || 'Something went wrong.',
                confirmButtonColor: '#d33',
            });
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">{mode === 'create' ? 'Create New Album' : 'Edit Album'}</h2>
                    <button
                        onClick={handleClose}
                        className="bg-unset text-black-500 p-1.5 rounded-full transition-colors"
                        title="Close"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Main Content */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-grow">
                    {/* Album Title */}
                    <div>
                        <label htmlFor="albumTitle" className="block text-sm font-medium text-gray-700 mb-2">
                            Album Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="albumTitle"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-gray-800 placeholder-gray-400 transition-all"
                            placeholder="E.g., Summer Vacation 2024"
                            required
                        />
                    </div>

                    {/* Album Description */}
                    <div>
                        <label htmlFor="albumDescription" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="albumDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-gray-800 placeholder-gray-400 resize-none transition-all"
                            placeholder="Describe your album..."
                        ></textarea>
                    </div>

                    {/* Privacy Setting */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Privacy
                        </label>
                        <div className="flex items-center space-x-4">
                            {userInfo?.approveStatus === 'approved' ? (
                                <>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                            name="privacy"
                                            value="family"
                                            checked={privacy === 'family'}
                                            onChange={(e) => setPrivacy(e.target.value)}
                                        />
                                        <span className="ml-2 text-gray-700">Private</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                            name="privacy"
                                            value="public"
                                            checked={privacy === 'public'}
                                            onChange={(e) => setPrivacy(e.target.value)}
                                        />
                                        <span className="ml-2 text-gray-700">Public</span>
                                    </label>
                                </>
                            ) : (
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        name="privacy"
                                        value="public"
                                        checked={true}
                                        disabled
                                    />
                                    <span className="ml-2 text-gray-700">Public (Only option for non-approved users)</span>
                                </label>
                            )}
                        </div>
                    </div>

                     {/* Family Code Input (conditionally rendered) */}
                     {privacy === 'family' && (
                        <div>
                            <label htmlFor="familyCode" className="block text-sm font-medium text-gray-700 mb-2">
                                Family Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="familyCode"
                                value={familyCode}
                                onChange={(e) => setFamilyCode(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 text-gray-800 placeholder-gray-400 transition-all"
                                placeholder="Enter family code"
                                required={privacy === 'family'}
                                readOnly
                            />
                            <p className="mt-1 text-sm text-gray-500">Family code is automatically set based on your family membership.</p>
                        </div>
                    )}

                    {/* Cover Photo Upload */}
                    <div>
                        <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                            Album Cover Photo (Optional)
                        </label>
                        <input
                            type="file"
                            id="coverPhoto"
                            ref={coverPhotoInputRef}
                            onChange={handleCoverPhotoChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => coverPhotoInputRef.current.click()}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 flex items-center justify-center"
                        >
                            <FaUpload className="mr-2 h-5 w-5 text-gray-500" />
                            {currentCoverPhotoUrl || coverPhotoFile ? 'Change Cover Photo' : 'Choose Cover Photo'}
                        </button>
                        {(coverPhotoFile || currentCoverPhotoUrl) && (
                            <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : currentCoverPhotoUrl}
                                    alt="Cover Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveCoverPhoto}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Remove cover photo"
                                >
                                    <FaTimes size={12} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Gallery Photos Upload Section */}
                    <div>
                        <label htmlFor="galleryPhotos" className="block text-sm font-medium text-gray-700 mb-2">
                            Add Photos to Album
                        </label>
                        <input
                            type="file"
                            id="galleryPhotos"
                            ref={galleryPhotoInputRef}
                            onChange={handleGalleryPhotosChange}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => galleryPhotoInputRef.current.click()}
                            className="w-full p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors text-primary-700 flex items-center justify-center"
                        >
                            <FaPlus className="mr-2 h-5 w-5" />
                            Add More Photos
                        </button>

                        {/* Photo Previews */}
                        {(currentGalleryPhotos.length > 0 || galleryPhotoFiles.length > 0) && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                                {/* Existing photos */}
                                {currentGalleryPhotos.map((photo, index) => (
                                    <div key={`existing-${photo.id || index}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <img
                                            src={photo.url}
                                            alt={`Existing gallery photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGalleryPhoto(index, true)}
                                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                title="Remove photo"
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Newly added photos */}
                                {galleryPhotoFiles.map((file, index) => (
                                    <div key={`new-${index}`} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`New gallery photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveGalleryPhoto(index, false)}
                                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                title="Remove photo"
                                            >
                                                <FaTrashAlt size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {(currentGalleryPhotos.length === 0 && galleryPhotoFiles.length === 0) && (
                            <p className="mt-2 text-sm text-gray-500 italic">No photos selected for the album yet.</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-1 ${
                                title.trim()
                                    ? 'bg-primary-500 hover:bg-primary-600 shadow-md'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            {mode === 'create' ? 'Create Album' : 'Update Album'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAlbumModal;
