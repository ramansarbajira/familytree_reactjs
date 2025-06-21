// src/Pages/PostsAndFeedsPage.js
import React, { useState } from 'react';
import Layout from '../Components/Layout';
import CreatePostModal from '../Components/CreatePostModal'; // Import the modal
import {
    FiImage, FiEdit3, FiTrash2, FiGlobe, FiUsers, FiPlusCircle, FiFeather, FiSearch, FiBell,
    FiCalendar, FiMapPin // Import FiCalendar and FiMapPin for events
} from 'react-icons/fi';
import { FaRegHeart, FaHeart, FaCommentDots, FaShareAlt } from 'react-icons/fa';
import { MdPublic, MdPeople } from 'react-icons/md'; // For privacy indicators

const PostsAndFeedsPage = () => {
    const currentUser = {
        id: "Sabarinath_Rajendran29",
        name: "Sabarinath_Rajendran29",
        avatar: "https://picsum.photos/seed/sabariuser/300/300",
    };

    const [activeFeed, setActiveFeed] = useState('family'); // 'family' or 'public'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for modal visibility

    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Sabarinath_Rajendran29",
            avatar: currentUser.avatar,
            time: "2 hours ago",
            content: "Just shared some old family photos! Reliving those golden memories. So much fun. Browse through them. #FamilyMemories #Throwback",
            image: "https://picsum.photos/seed/familypicnic/800/500",
            likes: 15,
            comments: 3,
            privacy: 'family',
            liked: false
        },
        {
            id: 2,
            author: "Priya Sharma",
            avatar: "https://picsum.photos/seed/priyasharma/300/300",
            time: "Yesterday",
            content: "Counting down to Mom's birthday! Planning a surprise party. Any gift ideas? 🎁🥳 #MomsBirthday #FamilyLove",
            image: "",
            likes: 8,
            comments: 5,
            privacy: 'family',
            liked: false
        },
        {
            id: 3,
            author: "Arjun Reddy",
            avatar: "https://picsum.photos/seed/arjunreddy/300/300",
            time: "3 days ago",
            content: "Had a great time at the community fair today! So many fun activities and delicious food. Highly recommend for a family day out. #CommunityFun #WeekendVibes",
            image: "https://picsum.photos/seed/communityfair/800/500",
            likes: 22,
            comments: 7,
            privacy: 'public',
            liked: false
        },
        {
            id: 4,
            author: "Sabarinath_Rajendran29",
            avatar: currentUser.avatar,
            time: "1 week ago",
            content: "Just finished a challenging hike with the family! The views were incredible. Feeling refreshed and connected. #NatureLovers #FamilyAdventure",
            image: "https://picsum.photos/seed/familyhike/800/500",
            likes: 10,
            comments: 2,
            privacy: 'family',
            liked: false
        },
        {
            id: 5,
            author: "Sneha Kapoor",
            avatar: "https://picsum.photos/seed/snehakapoor/300/300",
            time: "4 days ago",
            content: "Excited to announce my new photography exhibition next month! Will share more details soon. Hope to see you all there! #Photography #ArtExhibition",
            image: "https://picsum.photos/seed/artexhibition/800/500",
            likes: 30,
            comments: 10,
            privacy: 'public',
            liked: false
        },
    ]);

    const filteredPosts = activeFeed === 'family'
        ? posts.filter(post => post.privacy === 'family' || post.author === currentUser.name)
        : posts.filter(post => post.privacy === 'public');

    const handlePostCreated = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]); // Add new post to the top of the feed
    };

    const toggleLike = (postId) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );
    };

    return (
        <Layout>
            {/* Flex container for main content and right sidebar */}
            <div className="flex flex-col lg:flex-row lg:gap-8 max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">

                {/* Main Content (Feed) Column */}
                <div className="w-full lg:w-2/3 xl:w-3/4">

                    {/* Top Bar - Clean and Functional */}
                    <div className="flex items-center justify-between gap-4 py-3 mb-6">
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-none">FamConnect</h1>
                        <div className="flex items-center gap-3">
                            {/* Feed Switcher - Modern Segmented Control */}
                            <div className="relative inline-flex rounded-full bg-gray-100 p-1">
                                <button
                                    onClick={() => setActiveFeed('family')}
                                    className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-200 ${activeFeed === 'family' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}
                                >
                                    <MdPeople size={18} /> Family
                                </button>
                                <button
                                    onClick={() => setActiveFeed('public')}
                                    className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-200 ${activeFeed === 'public' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}`}
                                >
                                    <MdPublic size={18} /> Public
                                </button>
                            </div>

                            {/* Search and Notification Buttons */}
                            <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75">
                                <FiSearch size={20} />
                            </button>
                            <button className="relative p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75">
                                <FiBell size={20} />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </button>
                        </div>
                    </div>

                    {/* "What's on your mind?" - Integrated Post Trigger */}
                    <div className="bg-white rounded-xl p-3 flex items-center gap-3 mb-6 border border-gray-100 shadow-sm">
                        <img
                            src={currentUser.avatar}
                            alt="Your Avatar"
                            className="w-11 h-11 rounded-full object-cover border-2 border-primary-200 flex-shrink-0"
                        />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 text-left bg-gray-100 text-gray-500 rounded-full py-2.5 px-4 cursor-pointer hover:bg-gray-200 transition-colors text-base font-medium"
                        >
                            What's on your mind, {currentUser.name.split('_')[0]}?
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-primary-600 hover:text-primary-800 transition-colors p-2 rounded-full hover:bg-gray-100"
                            title="Add photo"
                        >
                            <FiImage size={24} />
                        </button>
                    </div>

                    {/* Main Feed Content - Streamlined Posts */}
                    <div className="space-y-4">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <div key={post.id} className="bg-white rounded-xl overflow-hidden animate-fade-in border border-gray-100">
                                    {/* Post Header */}
                                    <div className="flex items-center justify-between p-4 pb-2">
                                        <div className="flex items-center">
                                            <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-primary-200" />
                                            <div>
                                                <p className="font-bold text-gray-900 text-base">{post.author}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                    <span>{post.time}</span>
                                                    {post.privacy === 'family' ? (
                                                        <span className="flex items-center gap-0.5 text-primary-600" title="Visible to Family Only">
                                                            <FiUsers size={14} /> Family
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-0.5 text-green-600" title="Public Post">
                                                            <FiGlobe size={14} /> Public
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {post.author === currentUser.name && (
                                            <div className="flex items-center gap-1">
                                                <button className="bg-unset text-gray-400 hover:text-primary-600 transition p-2 rounded-full hover:bg-gray-100" title="Edit post">
                                                    <FiEdit3 size={18} />
                                                </button>
                                                <button className="bg-unset text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-gray-100" title="Delete post">
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Content */}
                                    <div className="px-4 py-2">
                                        <p className="text-gray-800 text-base leading-relaxed">{post.content}</p>
                                    </div>

                                    {/* Post Image */}
                                    {post.image && (
                                        <div className="w-full h-80 bg-gray-100 flex items-center justify-center overflow-hidden mt-3 mb-2">
                                            <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Post Footer - Likes, Comments, Share */}
                                    <div className="px-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                                <FaHeart className="text-red-500" /> {post.likes} Likes
                                            </span>
                                            <span className="cursor-pointer hover:underline">
                                                {post.comments} Comments
                                            </span>
                                        </div>
                                        <div className="flex -mx-1">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className={`bg-unset flex-1 flex items-center justify-center gap-2 py-2 px-1 rounded-lg font-medium transition-colors text-base hover:bg-gray-50 ${post.liked ? 'text-red-500' : 'text-gray-600'}`}
                                            >
                                                {post.liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />} Like
                                            </button>
                                            <button className="bg-unset flex-1 flex items-center justify-center gap-2 py-2 px-1 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition text-base">
                                                <FaCommentDots size={20} /> Comment
                                            </button>
                                            <button className="bg-unset flex-1 flex items-center justify-center gap-2 py-2 px-1 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition text-base">
                                                <FaShareAlt size={20} /> Share
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-600 border border-gray-100">
                                <p className="text-xl font-medium mb-4">No posts to display in the {activeFeed} feed yet!</p>
                                <p>Be the first to share a memorable moment with your family.</p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-6 bg-primary-500 text-white px-6 py-3 rounded-full flex items-center justify-center mx-auto gap-2 shadow-md hover:bg-primary-600 transition duration-300"
                                >
                                    <FiFeather size={20} /> Create First Post
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar Column (Desktop Only) */}
                <div className="hidden lg:block lg:w-1/3 xl:w-1/4 mt-8 lg:mt-0 space-y-4"> {/* Added space-y for consistent spacing between widgets */}

                    {/* IMPROVED Upcoming Events Widget - Professional Design (NOW FIRST) */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-5">Upcoming Events</h3>
                        <ul className="space-y-4">
                            {/* Event 1 */}
                            <li className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                                    <FiCalendar size={18} className="text-primary-600" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-semibold text-gray-800 text-base leading-tight">Grandma's 80th Birthday</p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        <span className="font-medium">June 25, 2025</span> • 6:00 PM
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <FiMapPin size={12} className="text-gray-400" /> Community Hall
                                    </p>
                                </div>
                            </li>
                            <hr className="border-gray-200" />
                            {/* Event 2 */}
                            <li className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="bg-primary-100 p-2 rounded-full flex-shrink-0">
                                    <FiCalendar size={18} className="text-primary-600" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-semibold text-gray-800 text-base leading-tight">Family Picnic at Lake View Park</p>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        <span className="font-medium">July 10, 2025</span> • 11:00 AM - 4:00 PM
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <FiMapPin size={12} className="text-gray-400" /> Lake View Park, Section B
                                    </p>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full mt-4 py-2 px-4 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-colors text-sm">
                            View All Events
                        </button>
                    </div>

                    {/* REVISED: Gift Ideas Widget - Image Left, Name/Price/Button Right */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg text-gray-800 mb-5">Gift Ideas for Family</h3>
                        <ul className="space-y-4"> {/* Using space-y for vertical gap between items */}
                            {/* Gift Item 1 */}
                            <li className="bg-gray-50 rounded-lg p-3 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift1/100/100" alt="Personalized Photo Album" className="w-24 h-24 rounded-md object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-sm mb-1 leading-tight line-clamp-2">Personalized Photo Album</p>
                                    <p className="text-base text-primary-700 font-bold mb-3">₹1,200</p>
                                    <button className="w-full bg-primary-500 text-white text-xs font-semibold py-2 rounded-md hover:bg-primary-600 transition-colors">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                            <hr className="border-gray-200" /> {/* Divider */}
                            {/* Gift Item 2 */}
                            <li className="bg-gray-50 rounded-lg p-3 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift2/100/100" alt="Smartwatch" className="w-24 h-24 rounded-md object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-sm mb-1 leading-tight line-clamp-2">Smartwatch</p>
                                    <p className="text-base text-primary-700 font-bold mb-3">₹8,500</p>
                                    <button className="w-full bg-primary-500 text-white text-xs font-semibold py-2 rounded-md hover:bg-primary-600 transition-colors">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                            <hr className="border-gray-200" /> {/* Divider */}
                            {/* Gift Item 3 */}
                            <li className="bg-gray-50 rounded-lg p-3 flex items-center shadow-sm border border-gray-100 transition-shadow hover:shadow-md cursor-pointer">
                                <img src="https://picsum.photos/seed/gift3/100/100" alt="Handmade Ceramic Mug Set" className="w-24 h-24 rounded-md object-cover flex-shrink-0 mr-4 border border-gray-200" />
                                <div className="flex-grow flex flex-col justify-center">
                                    <p className="font-semibold text-gray-800 text-sm mb-1 leading-tight line-clamp-2">Handmade Ceramic Mug Set</p>
                                    <p className="text-base text-primary-700 font-bold mb-3">₹750</p>
                                    <button className="w-full bg-primary-500 text-white text-xs font-semibold py-2 rounded-md hover:bg-primary-600 transition-colors">
                                        Buy Now
                                    </button>
                                </div>
                            </li>
                        </ul>
                        <button className="w-full mt-4 py-2 px-4 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 transition-colors text-sm">
                            View More Gift Ideas
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostCreated={handlePostCreated}
                currentUser={currentUser}
            />

            {/* Floating Action Button for Mobile - Optional */}
            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg lg:hidden z-40 hover:bg-primary-700 transition-colors transform hover:scale-110"
                title="Create New Post"
            >
                <FiPlusCircle size={28} />
            </button>
        </Layout>
    );
};

export default PostsAndFeedsPage;