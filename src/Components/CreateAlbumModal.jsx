import React, { useState, useRef } from 'react';
import { FaTimes, FaUpload, FaImage, FaTrashAlt, FaPlus } from 'react-icons/fa'; // Added FaPlus for new photo input

const CreateAlbumModal = ({ isOpen, onClose, onCreateAlbum }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('family'); // Default to 'family'
    const [coverPhotoFile, setCoverPhotoFile] = useState(null);
    const [galleryPhotoFiles, setGalleryPhotoFiles] = useState([]); // NEW STATE for multiple gallery photos
    const coverPhotoInputRef = useRef(null);
    const galleryPhotoInputRef = useRef(null); // NEW REF for gallery photos input

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrivacy('family');
        setCoverPhotoFile(null);
        setGalleryPhotoFiles([]); // Reset gallery photos too
        if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
        if (galleryPhotoInputRef.current) galleryPhotoInputRef.current.value = ''; // Clear file input
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCoverPhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setCoverPhotoFile(e.target.files[0]);
        }
    };

    // NEW HANDLER for multiple gallery photo selection
    const handleGalleryPhotosChange = (e) => {
        if (e.target.files) {
            // Convert FileList to Array and append to existing files
            const newFiles = Array.from(e.target.files);
            setGalleryPhotoFiles((prevFiles) => [...prevFiles, ...newFiles]);
            // Clear the input value so the same file(s) can be selected again
            e.target.value = null;
        }
    };

    // NEW HANDLER to remove a gallery photo
    const handleRemoveGalleryPhoto = (indexToRemove) => {
        setGalleryPhotoFiles((prevFiles) =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Album title is required!');
            return;
        }

        const newAlbumData = {
            title,
            description,
            privacy,
            coverPhotoFile, // Pass the File object for cover photo
            galleryPhotoFiles, // Pass the array of File objects for gallery photos
        };

        onCreateAlbum(newAlbumData);
        handleClose(); // Close and reset form after submission
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 sm:p-6 animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform scale-95 animate-scale-up">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <h3 className="text-2xl font-bold text-black">Create New Album</h3>
                    <button
                        onClick={handleClose}
                        className="text-white hover:text-gray-100 transition-colors"
                        title="Close"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Modal Body - Form */}
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
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
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
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
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-y transition duration-150 ease-in-out"
                                placeholder="Describe your album..."
                            ></textarea>
                        </div>

                        {/* Privacy Setting */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Privacy
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        className="form-radio h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        name="privacy"
                                        value="family"
                                        checked={privacy === 'family'}
                                        onChange={(e) => setPrivacy(e.target.value)}
                                    />
                                    <span className="ml-2 text-gray-700">Family Only</span>
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
                            </div>
                        </div>

                        {/* Cover Photo Upload */}
                        <div>
                            <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-700 mb-2">
                                Album Cover Photo (Optional)
                            </label>
                            <div className="mt-1 flex items-center space-x-4">
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
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                                >
                                    <FaUpload className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
                                    Choose Cover Photo
                                </button>
                                {coverPhotoFile && (
                                    <span className="text-sm text-gray-600 truncate max-w-[calc(100%-180px)]">
                                        {coverPhotoFile.name}
                                    </span>
                                )}
                            </div>
                            {coverPhotoFile && (
                                <div className="mt-4 relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <img
                                        src={URL.createObjectURL(coverPhotoFile)}
                                        alt="Cover Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCoverPhotoFile(null)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
                                        title="Remove cover photo"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* --- NEW: Gallery Photos Upload Section --- */}
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
                                multiple // Allow multiple file selection
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => galleryPhotoInputRef.current.click()}
                                className="inline-flex items-center px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                            >
                                <FaPlus className="mr-2 -ml-1 h-5 w-5" />
                                Add More Photos
                            </button>

                            {/* Photo Previews and Management */}
                            {galleryPhotoFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {galleryPhotoFiles.map((file, index) => (
                                        <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Gallery photo ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGalleryPhoto(index)}
                                                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors transform hover:scale-110"
                                                    title="Remove photo"
                                                >
                                                    <FaTrashAlt size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {galleryPhotoFiles.length === 0 && (
                                <p className="mt-2 text-sm text-gray-500 italic">No photos selected for the album yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Modal Footer - Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-primary from-green-500 to-teal-500 text-white font-semibold shadow-md hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                        >
                            Create Album
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAlbumModal;