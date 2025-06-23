import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { FiEdit3, FiHeart, FiMessageCircle, FiGrid, FiPlusSquare, FiImage, FiCamera, FiUserPlus, FiBookmark } from 'react-icons/fi';
import { RiGalleryLine } from 'react-icons/ri';
import { IoMdPhotos } from 'react-icons/io';
import { BsGrid3X3, BsBookmark, BsThreeDots } from 'react-icons/bs';

// Modals
import CreatePostModal from '../Components/CreatePostModal';
import CreateAlbumModal from '../Components/CreateAlbumModal';
import EditProfileModal from '../Components/EditProfileModal';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'galleries', 'saved'
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // User Data
    const user = {
        profileImage: "https://picsum.photos/seed/profileUser/400/400",
        name: "Sabarinath_Rajendran29",
        fullName: "Sabarinath Rajendran",
        basicInfo: "Aspiring Web Developer | Tech Enthusiast",
        bio: "Passionate about creating intuitive and dynamic web experiences. Love exploring new technologies and sharing family moments. Let's connect!",
        postsCount: 15,
        galleryCount: 8,
        followers: 120,
        following: 80,
        isVerified: true
    };

    // Content Data
    const userPosts = [
        { id: 1, type: 'image', url: "https://picsum.photos/seed/userPost1/600/600", caption: "Beach day with the family! ☀️ #FamilyFun", likes: 25, comments: 5 },
        { id: 2, type: 'image', url: "https://picsum.photos/seed/userPost2/600/600", caption: "Hiking adventure views. 🏞️ #NatureLover", likes: 32, comments: 7 },
        { id: 3, type: 'image', url: "https://picsum.photos/seed/userPost3/600/600", caption: "Celebrating Diwali! ✨ #FestivalVibes", likes: 40, comments: 10 },
        { id: 4, type: 'image', url: "https://picsum.photos/seed/userPost4/600/600", caption: "New coding project in progress. 💻 #DeveloperLife", likes: 18, comments: 2 },
        { id: 5, type: 'image', url: "https://picsum.photos/seed/userPost5/600/600", caption: "Throwback to our last vacation. ✈️ #TravelMemories", likes: 30, comments: 6 },
    ];

    const userGalleries = [
        { id: 1, name: "Summer Vacation 2024", cover: "https://picsum.photos/seed/galleryCover1/400/400", photosCount: 12 },
        { id: 2, name: "Family Events", cover: "https://picsum.photos/seed/galleryCover2/400/400", photosCount: 8 },
        { id: 3, name: "Pet Adventures", cover: "https://picsum.photos/seed/galleryCover3/400/400", photosCount: 5 },
    ];

    const savedPosts = [
        { id: 6, type: 'image', url: "https://picsum.photos/seed/savedPost1/600/600", caption: "Inspiration for my next project", likes: 42, comments: 8 },
        { id: 7, type: 'image', url: "https://picsum.photos/seed/savedPost2/600/600", caption: "Great UI design examples", likes: 56, comments: 12 },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                );
            case 'galleries':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userGalleries.map(gallery => (
                            <GalleryCard key={gallery.id} gallery={gallery} />
                        ))}
                    </div>
                );
            case 'saved':
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout fullWidth>
            {/* Profile Header */}
            <div className="bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0 flex justify-center md:block">
                            <div className="relative">
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                                <button 
                                    className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-md hover:bg-primary-600 transition"
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                >
                                    <FiCamera size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-grow text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
                                    {user.isVerified && (
                                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                        </svg>
                                    )}
                                </div>
                                <div className="flex justify-center md:justify-end gap-3 mt-4 md:mt-0">
                                    <button
                                        onClick={() => setIsCreatePostModalOpen(true)}
                                        className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-600 transition"
                                    >
                                        <FiPlusSquare size={16} /> Create Post
                                    </button>
                                    <button
                                        onClick={() => setIsEditProfileModalOpen(true)}
                                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition"
                                    >
                                        <FiEdit3 size={16} /> Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-start gap-8 mb-4">
                                <div className="text-center md:text-left">
                                    <span className="block font-bold text-lg">{user.postsCount}</span>
                                    <span className="block text-sm text-gray-500">Posts</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block font-bold text-lg">{user.followers}</span>
                                    <span className="block text-sm text-gray-500">Followers</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="block font-bold text-lg">{user.following}</span>
                                    <span className="block text-sm text-gray-500">Following</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h2 className="font-bold text-lg">{user.fullName}</h2>
                                <p className="text-gray-600">{user.basicInfo}</p>
                            </div>

                            <p className="text-gray-800 mb-4">{user.bio}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="border-t border-gray-200 bg-white sticky top-0 z-10">
                <div className="max-w-6xl mx-auto">
                    <nav className="flex justify-center md:justify-start">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center justify-center px-4 py-4 text-sm font-medium border-b-2 ${activeTab === 'posts' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <BsGrid3X3 className="mr-2" />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveTab('galleries')}
                            className={`flex items-center justify-center px-4 py-4 text-sm font-medium border-b-2 ${activeTab === 'galleries' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <RiGalleryLine className="mr-2" />
                            Galleries
                        </button>
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex items-center justify-center px-4 py-4 text-sm font-medium border-b-2 ${activeTab === 'saved' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <BsBookmark className="mr-2" />
                            Saved
                        </button>
                    </nav>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {renderContent()}

                {/* Empty State */}
                {((activeTab === 'posts' && userPosts.length === 0) ||
                 (activeTab === 'galleries' && userGalleries.length === 0) ||
                 (activeTab === 'saved' && savedPosts.length === 0)) && (
                    <div className="text-center py-16">
                        <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                            {activeTab === 'posts' && <IoMdPhotos size="100%" />}
                            {activeTab === 'galleries' && <RiGalleryLine size="100%" />}
                            {activeTab === 'saved' && <FiBookmark size="100%" />}
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {activeTab === 'posts' && 'No Posts Yet'}
                            {activeTab === 'galleries' && 'No Galleries Yet'}
                            {activeTab === 'saved' && 'No Saved Items'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {activeTab === 'posts' && 'Share your first post with your followers'}
                            {activeTab === 'galleries' && 'Create your first gallery to organize your photos'}
                            {activeTab === 'saved' && 'Save posts to view them later'}
                        </p>
                        <button
                            onClick={() => {
                                if (activeTab === 'posts') setIsCreatePostModalOpen(true);
                                if (activeTab === 'galleries') setIsCreateAlbumModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {activeTab === 'posts' && 'Create Post'}
                            {activeTab === 'galleries' && 'Create Gallery'}
                            {activeTab === 'saved' && 'Browse Posts'}
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Action Button for Mobile */}
            <div className="md:hidden fixed bottom-6 right-6">
                <button
                    onClick={() => {
                        if (activeTab === 'posts') setIsCreatePostModalOpen(true);
                        if (activeTab === 'galleries') setIsCreateAlbumModalOpen(true);
                    }}
                    className="bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition"
                >
                    {activeTab === 'posts' ? <FiPlusSquare size={24} /> : <FiCamera size={24} />}
                </button>
            </div>

            {/* Modals */}
            <CreatePostModal isOpen={isCreatePostModalOpen} onClose={() => setIsCreatePostModalOpen(false)} />
            <CreateAlbumModal isOpen={isCreateAlbumModalOpen} onClose={() => setIsCreateAlbumModalOpen(false)} />
            <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} />
        </Layout>
    );
};

// Reusable Post Card Component
const PostCard = ({ post }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={post.url}
                alt={post.caption}
                className="w-full h-64 object-cover"
            />
            {isHovered && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-4 text-white p-4">
                    <span className="flex items-center gap-1">
                        <FiHeart size={18} className="fill-current" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiMessageCircle size={18} /> {post.comments}
                    </span>
                </div>
            )}
        </div>
    );
};

// Reusable Gallery Card Component
const GalleryCard = ({ gallery }) => {
    return (
        <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative">
                <img
                    src={gallery.cover}
                    alt={gallery.name}
                    className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-medium">{gallery.name}</h3>
                    <p className="text-white text-sm opacity-80">{gallery.photosCount} photos</p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;