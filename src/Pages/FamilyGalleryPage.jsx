import React, { useState } from 'react';
import Layout from '../Components/Layout';
import GalleryViewerModal from '../Components/GalleryViewerModal';
import { FiSearch, FiBell, FiCalendar, FiMapPin, FiPlusCircle } from 'react-icons/fi';
import { MdPublic, MdPeople } from 'react-icons/md';
import CreateAlbumModal from '../Components/CreateAlbumModal'; // Ensure this path is correct

const FamilyGalleryPage = () => {
    const currentUser = {
        id: "Sabarinath_Rajendran29",
        name: "Sabarinath_Rajendran29",
        avatar: "https://picsum.photos/seed/sabariuser/300/300",
    };

    const [activeFeed, setActiveFeed] = useState('family'); // 'family' or 'public'
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null); // To store the album currently viewed in modal

    // --- NEW STATE FOR CREATE ALBUM MODAL ---
    const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);

    // --- Sample Gallery Data ---
    const [galleryAlbums, setGalleryAlbums] = useState([
        {
            id: 101,
            title: "Summer Vacation 2024",
            author: "Sabarinath_Rajendran29",
            privacy: 'family',
            coverPhoto: "https://picsum.photos/seed/summer_vacation_cover/400/300",
            photos: [
                { id: 1, url: "https://picsum.photos/seed/summer1/800/600", caption: "Beautiful beach sunset!", likes: 25, comments: ["Amazing!", "Wish I was there!"] },
                { id: 2, url: "https://picsum.photos/seed/summer2/800/600", caption: "Family fun by the waves.", likes: 18, comments: [] },
                { id: 3, url: "https://picsum.photos/seed/summer3/800/600", caption: "Adventures in the jungle.", likes: 30, comments: ["So green!", "What a view!"] },
                { id: 4, url: "https://picsum.photos/seed/summer4/800/600", caption: "Relaxing by the pool.", likes: 12, comments: [] },
                { id: 5, url: "https://picsum.photos/seed/summer5/800/600", caption: "Delicious local food.", likes: 20, comments: [] },
                { id: 6, url: "https://picsum.photos/seed/summer6/800/600", caption: "Morning jog with a view.", likes: 15, comments: [] },
                { id: 7, url: "https://picsum.photos/seed/summer7/800/600", caption: "Exploring the ancient ruins.", likes: 28, comments: [] },
                { id: 8, url: "https://picsum.photos/seed/summer8/800/600", caption: "Sunset dinner.", likes: 35, comments: [] },
                { id: 9, url: "https://picsum.photos/seed/summer9/800/600", caption: "Boat ride fun.", likes: 22, comments: [] },
                { id: 10, url: "https://picsum.photos/seed/summer10/800/600", caption: "Souvenir shopping.", likes: 10, comments: [] },
            ]
        },
        {
            id: 102,
            title: "Community Outreach Program",
            author: "Priya Sharma",
            privacy: 'public',
            coverPhoto: "https://picsum.photos/seed/community_cover/400/300",
            photos: [
                { id: 1, url: "https://picsum.photos/seed/community1/800/600", caption: "Volunteering with the team.", likes: 40, comments: ["Great initiative!", "Keep up the good work!"] },
                { id: 2, url: "https://picsum.photos/seed/community2/800/600", caption: "Distributing essentials.", likes: 35, comments: [] },
                { id: 3, url: "https://picsum.photos/seed/community3/800/600", caption: "Happy faces!", likes: 50, comments: [] },
            ]
        },
        {
            id: 103,
            title: "Diwali Celebrations 2023",
            author: "Sabarinath_Rajendran29",
            privacy: 'family',
            coverPhoto: "https://picsum.photos/seed/diwali_cover/400/300",
            photos: [
                { id: 1, url: "https://picsum.photos/seed/diwali1/800/600", caption: "Diwali pooja at home.", likes: 30, comments: [] },
                { id: 2, url: "https://picsum.photos/seed/diwali2/800/600", caption: "Lights and crackers!", likes: 28, comments: [] },
                { id: 3, url: "https://picsum.photos/seed/diwali3/800/600", caption: "Family dinner fun.", likes: 32, comments: [] },
                { id: 4, url: "https://picsum.photos/seed/diwali4/800/600", caption: "Rangoli designs.", likes: 20, comments: [] },
            ]
        },
        {
            id: 104,
            title: "Hiking Trip to Himalayas",
            author: "Arjun Reddy",
            privacy: 'public',
            coverPhoto: "https://picsum.photos/seed/himalayas_cover/400/300",
            photos: [
                { id: 1, url: "https://picsum.photos/seed/himalayas1/800/600", caption: "Breathtaking views!", likes: 60, comments: ["Incredible!", "So jealous!"] },
                { id: 2, url: "https://picsum.photos/seed/himalayas2/800/600", caption: "Conquering the peak.", likes: 55, comments: [] },
            ]
        }
    ]);

    const filteredAlbums = activeFeed === 'family'
        ? galleryAlbums.filter(album => album.privacy === 'family' || album.author === currentUser.name)
        : galleryAlbums.filter(album => album.privacy === 'public');

    const openGalleryModal = (album) => {
        setSelectedAlbum(album);
        setIsGalleryModalOpen(true);
    };

    const handlePhotoLike = (albumId, photoId) => {
        setGalleryAlbums(prevAlbums =>
            prevAlbums.map(album =>
                album.id === albumId
                    ? {
                        ...album,
                        photos: album.photos.map(photo =>
                            photo.id === photoId
                                ? { ...photo, likes: photo.likes + 1 } // Simplified like toggle for demonstration
                                : photo
                        )
                    }
                    : album
            )
        );
    };

    const openCreateAlbumModal = () => {
        setIsCreateAlbumModalOpen(true);
    };

    const handleCloseCreateAlbumModal = () => {
        setIsCreateAlbumModalOpen(false);
    };

    const handleCreateNewAlbum = ({ title, description, privacy, coverPhotoFile }) => {
        // In a real application, you would:
        // 1. Upload coverPhotoFile to a storage service (e.g., Firebase Storage, AWS S3)
        // 2. Get the URL of the uploaded photo
        // 3. Send album data (title, description, privacy, photoURL) to your backend API
        // 4. Update your local state after successful backend response

        // For this demo, we'll simulate an upload and generate a dummy URL.
        console.log("Creating new album:", { title, description, privacy, coverPhotoFile });

        // Simulate a new unique ID (using current timestamp for simplicity)
        const newAlbumId = Date.now();
        // Simulate a cover photo URL from the uploaded file
        const simulatedCoverPhotoUrl = coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : 'https://picsum.photos/seed/new_album_default/400/300';

        const newAlbum = {
            id: newAlbumId,
            title: title,
            author: currentUser.name, // Assign current user as author
            privacy: privacy,
            coverPhoto: simulatedCoverPhotoUrl,
            photos: [], // New albums start with no photos, or maybe just the cover photo if you wish
        };

        setGalleryAlbums(prevAlbums => [...prevAlbums, newAlbum]);
        console.log("Album created:", newAlbum);
        // Optionally, you can open the newly created album in the viewer modal
        // openGalleryModal(newAlbum);
    };

    return (
        <Layout>
            <div className="flex flex-col lg:flex-row lg:gap-10 max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">

                {/* Main Content (Gallery) Column */}
                <div className="w-full lg:w-2/3 xl:w-3/4">

                    {/* Top Bar - Enhanced with Create Album button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
                        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Your Photo Albums</h1>
                        <div className="flex items-center gap-3 mt-4 sm:mt-0">
                            {/* Feed Switcher - Modern Segmented Control */}
                            <div className="relative inline-flex rounded-full bg-gray-100 p-1 shadow-inner">
                                <button
                                    onClick={() => setActiveFeed('family')}
                                    className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeFeed === 'family' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-200'}`}
                                >
                                    <MdPeople size={18} /> Family
                                </button>
                                <button
                                    onClick={() => setActiveFeed('public')}
                                    className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${activeFeed === 'public' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-200'}`}
                                >
                                    <MdPublic size={18} /> Public
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <button className="p-2 rounded-full bg-white text-gray-600 shadow-md hover:bg-gray-100 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 tooltip" data-tooltip="Search Gallery">
                                <FiSearch size={20} />
                            </button>
                            <button className="relative p-2 rounded-full bg-white text-gray-600 shadow-md hover:bg-gray-100 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 tooltip" data-tooltip="Notifications">
                                <FiBell size={20} />
                                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                            </button>
                            {/* New: Create Album Button - ADDED onClick HANDLER */}
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-primary from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                onClick={openCreateAlbumModal} // <-- This opens the new modal
                            >
                                <FiPlusCircle size={20} /> Create Album
                            </button>
                        </div>
                    </div>

                    {/* Gallery Content - More Engaging Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                        {filteredAlbums.length > 0 ? (
                            filteredAlbums.map(album => (
                                <div
                                    key={album.id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 cursor-pointer transform hover:scale-[1.03] transition-all duration-300 ease-in-out group relative"
                                    onClick={() => openGalleryModal(album)}
                                >
                                    <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                                        <img
                                            src={album.coverPhoto}
                                            alt={album.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            {album.photos.length > 0 && (
                                                <span className="text-white text-sm font-semibold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                                                    {album.photos.length} Photos
                                                </span>
                                            )}
                                        </div>
                                        {album.photos.length > 1 && (
                                            <div className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-bounce-slow">
                                                +{album.photos.length - 1} More
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">{album.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">by <span className="font-medium text-primary-700">{album.author}</span></p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            {album.privacy === 'family' ? (
                                                <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-medium" title="Family Album">
                                                    <MdPeople size={16} /> Family
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full font-medium" title="Public Album">
                                                    <MdPublic size={16} /> Public
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="sm:col-span-2 md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-xl p-10 text-center text-gray-600 border border-gray-100 flex flex-col items-center justify-center">
                                <p className="text-2xl font-bold mb-4 text-gray-800">No albums here yet!</p>
                                <p className="text-lg mb-6">Looks like the **{activeFeed}** feed is a bit quiet. Why not be the first to share?</p>
                                {/* "Create Your First Album" Button - ADDED onClick HANDLER */}
                                <button
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:from-primary-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                                    onClick={openCreateAlbumModal} // <-- This also opens the new modal
                                >
                                    <FiPlusCircle size={20} /> Create Your First Album
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Column (Desktop Only) - Refined Design */}
                <div className="hidden lg:block lg:w-1/3 xl:w-1/4 mt-8 lg:mt-0 space-y-8">
                    {/* Upcoming Events Widget */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                            <FiCalendar size={22} className="text-primary-500" /> Upcoming Events
                        </h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 p-4 -mx-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="bg-primary-100 p-3 rounded-full flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                                    <FiCalendar size={20} className="text-primary-600" />
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <p className="font-semibold text-gray-800 text-base leading-tight">Grandma's 80th Birthday Bash!</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium text-primary-700">June 25, 2025</span> • 6:00 PM
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <FiMapPin size={14} className="text-gray-400" /> Community Hall, Sector 7
                                    </p>
                                </div>
                            </li>
                            <hr className="border-gray-200 mx-4" />
                            <li className="flex items-start gap-4 p-4 -mx-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="bg-primary-100 p-3 rounded-full flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                                    <FiCalendar size={20} className="text-primary-600" />
                                </div>
                                <div className="flex flex-col flex-grow">
                                    <p className="font-semibold text-gray-800 text-base leading-tight">Family Picnic at Lake View Park</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium text-primary-700">July 10, 2025</span> • 11:00 AM - 4:00 PM
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <FiMapPin size={14} className="text-gray-400" /> Lake View Park, Section B
                                    </p>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-3 px-4 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm">
                            View All Events
                        </button>
                    </div>

                    {/* Gift Ideas Widget */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                        <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                            <img src="https://www.svgrepo.com/show/360980/gift.svg" alt="Gift Icon" className="w-6 h-6 text-primary-500" /> Gift Ideas for Family
                        </h3>
                        <ul className="space-y-5">
                            <li className="bg-gray-50 rounded-xl p-4 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift1/120/120" alt="Personalized Photo Album" className="w-28 h-28 rounded-lg object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-base mb-1 leading-tight line-clamp-2">Personalized Photo Album</p>
                                    <p className="text-lg text-primary-700 font-bold mb-3">₹1,200</p>
                                    <button className="w-full bg-primary from-teal-500 to-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow-md">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                            <hr className="border-gray-200 mx-4" />
                            <li className="bg-gray-50 rounded-xl p-4 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift2/120/120" alt="Smartwatch" className="w-28 h-28 rounded-lg object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-base mb-1 leading-tight line-clamp-2">Smartwatch</p>
                                    <p className="text-lg text-primary-700 font-bold mb-3">₹8,500</p>
                                    <button className="w-full bg-primary from-teal-500 to-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow-md">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                            <hr className="border-gray-200 mx-4" />
                            <li className="bg-gray-50 rounded-xl p-4 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift3/120/120" alt="Handmade Ceramic Mug Set" className="w-28 h-28 rounded-lg object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-base mb-1 leading-tight line-clamp-2">Handmade Ceramic Mug Set</p>
                                    <p className="text-lg text-primary-700 font-bold mb-3">₹750</p>
                                    <button className="w-full bg-primary from-teal-500 to-blue-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors shadow-md">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full mt-6 py-3 px-4 bg-primary-50 text-primary-700 font-semibold rounded-xl hover:bg-primary-100 transition-colors text-sm shadow-sm">
                            Explore More Gift Ideas
                        </button>
                    </div>
                </div>
            </div>

            {/* Gallery Viewer Modal (Existing) */}
            {selectedAlbum && (
                <GalleryViewerModal
                    isOpen={isGalleryModalOpen}
                    onClose={() => setIsGalleryModalOpen(false)}
                    album={selectedAlbum}
                    onLikePhoto={handlePhotoLike} // Pass the like handler
                />
            )}

            ---
            ### NEW: Create Album Modal
            ---
            <CreateAlbumModal
                isOpen={isCreateAlbumModalOpen}
                onClose={handleCloseCreateAlbumModal}
                onCreateAlbum={handleCreateNewAlbum}
            />
        </Layout>
    );
};

export default FamilyGalleryPage;