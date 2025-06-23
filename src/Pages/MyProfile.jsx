import React, { useState } from 'react';
import Layout from '../Components/Layout'; // Assuming Layout is in Components
import { FiEdit3, FiHeart, FiMessageCircle, FiGrid, FiPlusSquare, FiImage, FiSettings, FiCamera } from 'react-icons/fi';

// Assuming these modals exist in your Components directory
import CreatePostModal from '../Components/CreatePostModal';
import CreateAlbumModal from '../Components/CreateAlbumModal';
import AddMemberFormModal from '../Components/AddMemberFormModal';
import GalleryViewerModal from '../Components/GalleryViewerModal';
import PostViewerModal from '../Components/PostViewerModal'; // Import the new PostViewerModal

const ProfilePage = () => {
    const [showPosts, setShowPosts] = useState(true); // true for posts, false for galleries
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
    const [isAddMemberFormModalOpen, setIsAddMemberFormModalOpen] = useState(false);

    // --- State for Gallery Viewer Modal ---
    const [isGalleryViewerOpen, setIsGalleryViewerOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    // --- State for Post Viewer Modal --- (NEW)
    const [isPostViewerOpen, setIsPostViewerOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    // --- User Data (Placeholder - replace with actual user data from props/context) ---
    const user = {
        profileImage: "https://picsum.photos/seed/profileUser/400/400", // Unique seed for profile
        name: "Sabarinath_Rajendran29",
        fullName: "Sabarinath Rajendran",
        basicInfo: "Aspiring Web Developer | Tech Enthusiast",
        bio: "Passionate about creating intuitive and dynamic web experiences. Love exploring new technologies and sharing family moments. Let's connect!",
        postsCount: 15,
        galleryCount: 8,
        followers: 120,
        following: 80,
    };

    // --- Placeholder Data for Posts and Galleries ---
    // Added comments array to each post for the PostViewerModal
    const [userPosts, setUserPosts] = useState([ // Made mutable for like updates
        { id: 1, type: 'image', url: "https://picsum.photos/seed/userPost1/600/600", caption: "Beach day with the family! ☀️ #FamilyFun", likes: 25, comments: ["Looks amazing!", "So much fun!", "Beautiful place!"] },
        { id: 2, type: 'image', url: "https://picsum.photos/seed/userPost2/600/600", caption: "Hiking adventure views. 🏞️ #NatureLover", likes: 32, comments: ["Stunning views!", "Great shot.", "Adventure time!"] },
        { id: 3, type: 'image', url: "https://picsum.photos/seed/userPost3/600/600", caption: "Celebrating Diwali! ✨ #FestivalVibes", likes: 40, comments: ["Happy Diwali!", "Such vibrant colors!", "Fun times!"] },
        { id: 4, type: 'image', url: "https://picsum.photos/seed/userPost4/600/600", caption: "New coding project in progress. 💻 #DeveloperLife", likes: 18, comments: ["What are you building?", "Keep up the great work!"] },
        { id: 5, type: 'image', url: "https://picsum.photos/seed/userPost5/600/600", caption: "Throwback to our last vacation. ✈️ #TravelMemories", likes: 30, comments: ["Looks like a blast!", "Take me with you next time!", "Memories!"] },
    ]);


    // --- ENHANCED GALLERY DATA WITH PHOTOS ARRAY FOR MODAL ---
    const [userGalleries, setUserGalleries] = useState([ // Made mutable for like updates
        {
            id: 1,
            title: "Summer Vacation 2024",
            author: "Sabarinath_Rajendran29",
            cover: "https://picsum.photos/seed/galleryCover1/400/400",
            photosCount: 4,
            photos: [
                { id: 'p1', url: "https://picsum.photos/seed/vacation1/800/600", caption: "Beach sunset views.", likes: 22, comments: ["Beautiful!", "Wish I was there."] },
                { id: 'p2', url: "https://picsum.photos/seed/vacation2/800/600", caption: "Exploring local markets.", likes: 18, comments: ["Looks fun!"] },
                { id: 'p3', url: "https://picsum.photos/seed/vacation3/800/600", caption: "Morning coffee by the sea.", likes: 30, comments: ["Perfect start to the day.", "So peaceful."] },
                { id: 'p4', url: "https://picsum.photos/seed/vacation4/800/600", caption: "Dinner with a view.", likes: 25, comments: ["Amazing food!", "What a view!"] },
            ]
        },
        {
            id: 2,
            title: "Family Events & Celebrations",
            author: "Sabarinath_Rajendran29",
            cover: "https://picsum.photos/seed/galleryCover2/400/400",
            photosCount: 3,
            photos: [
                { id: 'p5', url: "https://picsum.photos/seed/familyevent1/800/600", caption: "Birthday joy!", likes: 45, comments: ["Happy Birthday!", "Great pic."] },
                { id: 'p6', url: "https://picsum.photos/seed/familyevent2/800/600", caption: "Diwali festivities!", likes: 50, comments: ["Such vibrant colors!", "Fun times!"] },
                { id: 'p7', url: "https://picsum.photos/seed/familyevent3/800/600", caption: "Anniversary dinner.", likes: 38, comments: ["Congrats!", "Lovely couple."] },
            ]
        },
        {
            id: 3,
            title: "Pet Adventures",
            author: "Sabarinath_Rajendran29",
            cover: "https://picsum.photos/seed/galleryCover3/400/400",
            photosCount: 2,
            photos: [
                { id: 'p8', url: "https://picsum.photos/seed/pet1/800/600", caption: "Walk in the park with Buddy.", likes: 60, comments: ["So cute!", "What a good boy."] },
                { id: 'p9', url: "https://picsum.photos/seed/pet2/800/600", caption: "Nap time is the best time.", likes: 55, comments: ["Sweet dreams!", "Adorable!"] },
            ]
        },
        {
            id: 4,
            title: "Tech Meetups",
            author: "Sabarinath_Rajendran29",
            cover: "https://picsum.photos/seed/galleryCover4/400/400",
            photosCount: 3,
            photos: [
                { id: 'p10', url: "https://picsum.photos/seed/tech1/800/600", caption: "Learning new things!", likes: 20, comments: ["Inspiring!", "Great session."] },
                { id: 'p11', url: "https://picsum.photos/seed/tech2/800/600", caption: "Networking and coffee.", likes: 15, comments: ["Good connections!", "Productive day."] },
                { id: 'p12', url: "https://picsum.photos/seed/tech3/800/600", caption: "Deep dive into AI.", likes: 28, comments: ["Fascinating topic!", "Keep it up!"] },
            ]
        },
        {
            id: 5,
            title: "Nature Escapes",
            author: "Sabarinath_Rajendran29",
            cover: "https://picsum.photos/seed/galleryCover5/400/400",
            photosCount: 3,
            photos: [
                { id: 'p13', url: "https://picsum.photos/seed/nature1/800/600", caption: "Serene mountain views.", likes: 35, comments: ["Breathtaking!", "So peaceful."] },
                { id: 'p14', url: "https://picsum.photos/seed/nature2/800/600", caption: "Forest walk.", likes: 30, comments: ["Refreshing!", "Love the greenery."] },
                { id: 'p15', url: "https://picsum.photos/seed/nature3/800/600", caption: "Riverside tranquility.", likes: 40, comments: ["What a spot!", "Pure bliss."] },
            ]
        },
    ]);

    const handleCreatePostClick = () => setIsCreatePostModalOpen(true);
    const handleCreateAlbumClick = () => setIsCreateAlbumModalOpen(true);
    const handleEditProfileClick = () => setIsAddMemberFormModalOpen(true);

    // --- Handlers for Gallery Viewer Modal ---
    const handleViewAlbum = (album) => {
        setSelectedAlbum(album);
        setIsGalleryViewerOpen(true);
    };

    const handleCloseGalleryViewer = () => {
        setIsGalleryViewerOpen(false);
        setSelectedAlbum(null); // Clear selected album when closing
    };

    const handleLikePhotoInModal = (albumId, photoId) => {
        // This is a placeholder function. In a real app, you'd dispatch an action
        // to update your global state (e.g., Redux, Context API) or make an API call
        // to update the like count for the specific photo.
        console.log(`Liked photo ${photoId} in album ${albumId}`);

        // OPTIONAL: Update the userGalleries state here temporarily
        setUserGalleries(prevGalleries => prevGalleries.map(album => {
            if (album.id === albumId) {
                const updatedPhotos = album.photos.map(photo => {
                    if (photo.id === photoId) {
                        // Toggle like count (simple increment/decrement for demonstration)
                        const newLikes = photo.likes > 20 ? photo.likes - 1 : photo.likes + 1;
                        return { ...photo, likes: newLikes };
                    }
                    return photo;
                });
                return { ...album, photos: updatedPhotos };
            }
            return album;
        }));
        // Also update the selectedAlbum state if it's currently open
        setSelectedAlbum(prevAlbum => {
            if (!prevAlbum || prevAlbum.id !== albumId) return prevAlbum;
            const updatedPhotos = prevAlbum.photos.map(photo => {
                if (photo.id === photoId) {
                    const newLikes = photo.likes > 20 ? photo.likes - 1 : photo.likes + 1;
                    return { ...photo, likes: newLikes };
                }
                return photo;
            });
            return { ...prevAlbum, photos: updatedPhotos };
        });
    };

    // --- Handlers for Post Viewer Modal --- (NEW)
    const handleViewPost = (post) => {
        setSelectedPost(post);
        setIsPostViewerOpen(true);
    };

    const handleClosePostViewer = () => {
        setIsPostViewerOpen(false);
        setSelectedPost(null); // Clear selected post when closing
    };

    const handleLikePostInModal = (postId) => {
        console.log(`Liked post ${postId}`);
        setUserPosts(prevPosts => prevPosts.map(post => {
            if (post.id === postId) {
                // Toggle like count (simple increment/decrement for demonstration)
                const newLikes = post.likes > 20 ? post.likes - 1 : post.likes + 1;
                return { ...post, likes: newLikes };
            }
            return post;
        }));
        // Also update the selectedPost state if it's currently open
        setSelectedPost(prevPost => {
            if (!prevPost || prevPost.id !== postId) return prevPost;
            const newLikes = prevPost.likes > 20 ? prevPost.likes - 1 : prevPost.likes + 1;
            return { ...prevPost, likes: newLikes };
        });
    };


    return (
        <Layout>
            <div className="mx-auto px-4 py-4 md:px-6 lg:px-8 space-y-8 font-inter">
                {/* Profile Header Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-gray-100">
                    <div className="flex-shrink-0">
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary-400 shadow-lg"
                        />
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:justify-between mb-3 gap-2">
                            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{user.name}</h1>
                            <button
                                onClick={handleEditProfileClick}
                                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-primary-700 transition duration-300 flex items-center gap-2 font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
                            >
                                <FiEdit3 size={18} /> Edit Profile
                            </button>
                        </div>
                        <p className="text-lg text-gray-700 font-semibold mb-1">{user.fullName}</p>
                        <p className="text-md text-gray-500 mb-4">{user.basicInfo}</p>
                        <p className="text-gray-800 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{user.bio}</p>

                        <div className="flex justify-center md:justify-start gap-8 mt-5 pt-4 border-t border-gray-100">
                            <div className="text-center">
                                <span className="block font-bold text-xl md:text-2xl text-gray-900">{user.postsCount}</span>
                                <span className="block text-sm text-gray-500">Posts</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-xl md:text-2xl text-gray-900">{user.followers}</span>
                                <span className="block text-sm text-gray-500">Followers</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-xl md:text-2xl text-gray-900">{user.following}</span>
                                <span className="block text-sm text-gray-500">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Toggles and Add Buttons */}
                <div className="flex justify-center items-center gap-4 bg-white rounded-xl shadow-sm p-2 md:p-3 border border-gray-100">
                    <button
                        onClick={() => setShowPosts(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                            showPosts ? 'bg-primary-100 text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FiGrid size={20} /> Created Posts
                    </button>
                    <button
                        onClick={handleCreatePostClick}
                        className="p-2.5 rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
                        title="Create New Post"
                    >
                        <FiPlusSquare size={20} />
                    </button>

                    <span className="text-gray-300 mx-2">|</span> {/* Separator */}

                    <button
                        onClick={() => setShowPosts(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                            !showPosts ? 'bg-primary-100 text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FiImage size={20} /> Created Galleries
                    </button>
                    <button
                        onClick={handleCreateAlbumClick}
                        className="p-2.5 rounded-full bg-primary-600 text-white shadow hover:bg-primary-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
                        title="Create New Gallery"
                    >
                        <FiCamera size={20} />
                    </button>
                </div>

                 {/* Content Display Area */}
                {showPosts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100
                                                            transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleViewPost(post)} // Click to open PostViewerModal (NEW)
                                >
                                    <div className="relative w-full h-64 overflow-hidden"> {/* Fixed height for consistent look */}
                                        <img
                                            src={post.url}
                                            alt={post.caption}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{post.caption}</p>
                                        <div className="flex items-center text-gray-500 text-xs gap-4">
                                            <span className="flex items-center gap-1">
                                                <FiHeart size={14} className="text-red-500" /> {post.likes}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiMessageCircle size={14} /> {post.comments.length} {/* Use .length for comments */}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="lg:col-span-3 text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
                                <p className="text-gray-500 text-lg mb-4">No posts yet. Share your first family moment!</p>
                                <button
                                    onClick={handleCreatePostClick}
                                    className="bg-primary-500 text-white px-8 py-3 rounded-full shadow hover:bg-primary-600 transition-colors text-base font-medium"
                                >
                                    Create First Post
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userGalleries.length > 0 ? (
                            userGalleries.map(gallery => (
                                <div
                                    key={gallery.id}
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100
                                                transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleViewAlbum(gallery)} // Click to open GalleryViewerModal
                                >
                                    <div className="relative w-full h-64 overflow-hidden"> {/* Fixed height for consistent look */}
                                        <img
                                            src={gallery.cover}
                                            alt={gallery.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                            <div className="text-white">
                                                <h3 className="text-lg font-semibold mb-0.5">{gallery.title}</h3>
                                                <p className="text-sm opacity-90">{gallery.photosCount} photos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="lg:col-span-3 text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
                                <p className="text-gray-500 text-lg mb-4">No galleries yet. Organize your cherished memories!</p>
                                <button
                                    onClick={handleCreateAlbumClick}
                                    className="bg-primary-500 text-white px-8 py-3 rounded-full shadow hover:bg-primary-600 transition-colors text-base font-medium"
                                >
                                    Create First Album
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setIsCreatePostModalOpen(false)}
            />
            <CreateAlbumModal
                isOpen={isCreateAlbumModalOpen}
                onClose={() => setIsCreateAlbumModalOpen(false)}
            />
            <AddMemberFormModal
                isOpen={isAddMemberFormModalOpen}
                onClose={() => setIsAddMemberFormModalOpen(false)}
            />
            <GalleryViewerModal
                isOpen={isGalleryViewerOpen}
                onClose={handleCloseGalleryViewer}
                album={selectedAlbum}
                onLikePhoto={handleLikePhotoInModal}
            />
            {/* NEW: PostViewerModal */}
            <PostViewerModal
                isOpen={isPostViewerOpen}
                onClose={handleClosePostViewer}
                post={selectedPost}
                onLikePost={handleLikePostInModal}
            />
        </Layout>
    );
};

export default ProfilePage;
