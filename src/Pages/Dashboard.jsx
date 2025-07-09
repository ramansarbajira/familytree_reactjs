import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext'; 
import CreateEventModal from '../Components/CreateEventModal'; // Import your modal component
import ProfileFormModal from '../Components/ProfileFormModal';
import { FiUsers, FiCalendar, FiGift, FiImage, FiPlusCircle, FiShare2, FiHeart, FiMessageCircle, FiEdit3, FiPaperclip, FiTag, FiClock, FiSettings, FiChevronsRight, FiBell, FiSearch } from 'react-icons/fi';
import CreateAlbumModal from '../Components/CreateAlbumModal';
import CreatePostModal from '../Components/CreatePostModal';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RiUser3Line } from 'react-icons/ri';

const Dashboard = ({ apiBaseUrl = import.meta.env.VITE_API_BASE_URL }) => {
  // State for modal visibility
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);
  const { userInfo } = useUser();
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [galleryCount, setGalleryCount] = useState(0);
  const [familyStats, setFamilyStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [latestPhotos, setLatestPhotos] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);

  // const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
  if (userInfo?.familyCode && token) {
    fetch(`${apiBaseUrl}/post/by-options?privacy=private&familyCode=${userInfo.familyCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('✅ Fetched posts:', data);

        // Latest date first, then slice first 2
        const sortedPosts = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);

        // Format for your UI
        const formattedPosts = sortedPosts.map((post) => ({
          id: post.id,
          author: `${post.userProfile.firstName} ${post.userProfile.lastName}`,
          avatar: post.user?.profile,
          time: new Date(post.createdAt).toLocaleDateString(),
          content: post.caption,
          image: post.postImage,
          likes: post.likeCount,
          comments: post.commentCount,
        }));

        setRecentPosts(formattedPosts);
      })
      .catch((error) => {
        console.error('❌ Error fetching posts:', error);
      });
  }
}, [apiBaseUrl, userInfo?.familyCode, token]);


useEffect(() => {
  if (userInfo?.familyCode && token) {
    fetch(
      `${apiBaseUrl}/family/member/${userInfo.familyCode}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('✅ Stats API result:', result);
        setFamilyStats(result.data);
      })
      .catch((error) => {
        console.error('Error fetching family stats:', error);
      });
  }
}, [apiBaseUrl, userInfo?.familyCode, token]);

  useEffect(() => {
    fetch(`${apiBaseUrl}/event/upcoming`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // 👈 Check the response in console
        setUpcomingEvents(data.slice(0, 3)); // ✅ Only first 3 events
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

 useEffect(() => {
  if (userInfo?.familyCode && token) {
    fetch(`${apiBaseUrl}/gallery/by-options?familyCode=${userInfo.familyCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setGalleryCount(data.length);
        const latestFive = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setLatestPhotos(latestFive);

        // For this section: take last 3 (most recent)
        const latestThree = data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setRecentUploads(latestThree);
      })
      .catch((error) => {
        console.error('Error fetching gallery data:', error);
      });
  }
}, [apiBaseUrl, userInfo?.familyCode, token]);

useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- RELIABLE LOREM PICSUM IMAGE LINKS ---
  const currentUserAvatar = "https://picsum.photos/seed/user1/300/300"; // Unique seed for current user

   useEffect(() => {
    console.log('🔗 API Base URL:', apiBaseUrl);
    console.log('🌍 Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  }, [apiBaseUrl]);

   useEffect(() => {
    // Fetch upcoming events count
     fetch(`${apiBaseUrl}/event/upcoming`)
      .then((response) => response.json())
      .then((data) => {
        // Count how many events are in the response array
        setUpcomingEventsCount(data.length);
      })
      .catch((error) => {
        console.error('Error fetching upcoming events:', error);
      });
  }, []);


  // Handler functions for modal
  const handleOpenCreateEventModal = () => {
    setIsCreateEventModalOpen(true);
  };

  const handleCloseCreateEventModal = () => {
    setIsCreateEventModalOpen(false);
  };

   const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleOpenCreateAlbumModal = () => {
    setIsCreateAlbumModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseCreateAlbumModal = () => {
    setIsCreateAlbumModalOpen(false);
  };
  const handleAlbumCreated = (newAlbum) => {
    console.log('New album created:', newAlbum);
    // You can add logic here to refresh your gallery data
    // For example, call a parent function to refresh the albums list
    // onAlbumCreated?.(newAlbum);
  };

  // Handler for when a new member is successfully added
  const handleAddMember = (newMemberData) => {
    // You can update your state here if needed
    console.log('New member added:', newMemberData);
    // Optionally show a success message
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Family member added successfully.',
      confirmButtonColor: '#3f982c',
    });
  };
const handleOpenCreatePost = () => setIsCreatePostModalOpen(true);
const handleCloseCreatePost = () => setIsCreatePostModalOpen(false);
console.log("userInfo:", userInfo);
console.log("token:", token);

 const handleViewAll = () => {
    navigate('/events');
  };
 

  return (
    <Layout>
      {/* Main Content Wrapper - Responsive Padding */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-10">

        {/* Dashboard Header - Enhanced with Search and Notifications */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex-grow">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Your Family Hub</h1>
              <p className="text-gray-600 mt-2 text-lg">
                 Welcome, {userInfo?.firstName || 'User'} {userInfo?.lastName || ''} ! Here's what's happening today, 
                 <span className="font-semibold text-primary-700">{formattedDate}</span>.
              </p>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* NEW IMPROVED OVERVIEW CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Member Count Card - Green background on hover */}
  <div className="bg-white hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-700 rounded-2xl shadow-xl p-6 relative overflow-hidden group transform hover:scale-105 transition-all duration-300">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <FiUsers className="text-gray-600 group-hover:text-black group-hover:opacity-90 transition-colors duration-300" size={40} />
        <span className="text-gray-500 group-hover:text-black/80 text-sm font-medium tracking-wide transition-colors duration-300">FAMILY</span>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">
          {familyStats?.totalMembers ?? '...'}
        </h2>
        <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Family Members</p>
        <div className="w-full bg-gray-200 group-hover:bg-black/30 h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-300">
          <div className="bg-primary-600 group-hover:bg-black h-full w-3/4 rounded-full transition-colors duration-300"></div>
        </div>
        <button   onClick={() => navigate('/my-family-member')} className="bg-unset mt-4 text-xs font-medium text-primary-600 group-hover:text-black hover:text-black/80 transition-colors flex items-center">
          Manage Members <FiChevronsRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  </div>

  {/* Events Card - Green background on hover */}
  <div className="bg-white hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-700 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:translate-y-[-5px] hover:scale-105">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <FiCalendar className="text-primary-600 group-hover:text-black group-hover:opacity-90 transition-colors duration-300" size={40} />
        <span className="text-gray-500 group-hover:text-black/80 text-sm font-medium tracking-wide transition-colors duration-300">EVENTS</span>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">{upcomingEventsCount}</h2>
        <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Upcoming Events</p>
        <div className="flex space-x-1 mt-3">
          {['🎂', '💍', '🎈'].map((icon, i) => (
            <span 
              key={i}
              className="inline-block transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-200"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {icon}
            </span>
          ))}
        </div>
        <button  onClick={() => navigate('/events')}
        className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 group-hover:text-black hover:text-black/80 transition-colors flex items-center">
          View Calendar <FiChevronsRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  </div>

  {/* Gifts Card - Green background on hover */}
  <div className="bg-white hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-700 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:scale-105">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <FiGift className="text-primary-600 group-hover:text-black group-hover:opacity-90 transition-colors duration-300" size={40} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            2
          </span>
        </div>
        <span className="text-gray-500 group-hover:text-black/80 text-sm font-medium tracking-wide transition-colors duration-300">GIFTS</span>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">2</h2>
        <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Sent this month</p>
        <button  onClick={() => navigate('/gifts-memories')}
         className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 group-hover:text-black hover:text-black/80 transition-colors flex items-center">
          Track Gifts <FiChevronsRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  </div>

  {/* Gallery Card - Green background on hover */}
  <div className="bg-white hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-700 rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:translate-y-[-5px] hover:scale-105">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <FiImage className="text-primary-600 group-hover:text-black group-hover:opacity-90 transition-colors duration-300" size={40} />
        <span className="text-gray-500 group-hover:text-black/80 text-sm font-medium tracking-wide transition-colors duration-300">GALLERY</span>
      </div>
      <div>
        <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">{galleryCount}</h2>
        <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Recent Uploads</p>
       
       
       
       <div className="flex -space-x-2 mt-3">
  {latestPhotos.map((item, index) => (
    <div 
      key={item.id || index}
      className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-gray-200 overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-200"
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <img 
        src={item.coverPhoto} // <-- or whatever your API field is
        alt={item.title || 'Gallery thumbnail'}
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>

        <button   onClick={() => navigate('/family-gallery')}
         className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 group-hover:text-black hover:text-black/80 transition-colors flex items-center">
          Browse Gallery <FiChevronsRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  </div>
</div>

        {/* Quick Actions - Responsive Grid, all Primary Themed, with subtle animations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
             <button 
            onClick={handleOpenProfileModal}
            className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group"
          >
            <FiPlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="font-semibold">Add New Member</span>
          </button>
          <button  onClick={handleOpenCreateAlbumModal}
          className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiImage size={20} className="group-hover:scale-110 transition-transform duration-300" /> <span className="font-semibold">Upload Photo</span>
          </button>
          <button    onClick={() => navigate('/gifts-memories')} className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiGift size={20} className="group-hover:animate-bounce-once transition-transform duration-300" /> <span className="font-semibold">Send a Gift</span>
          </button>
          <button 
            onClick={handleOpenCreateEventModal}
            className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group"
          >
            <FiCalendar size={20} className="group-hover:rotate-6 transition-transform duration-300" /> <span className="font-semibold">Schedule Event</span>
          </button>
        </div>

        {/* Main Content Area: Posts & Activities - Responsive Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Posts / Activity Feed (Takes 2/3 on large screens, full width on small) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Family Activity Feed</h2>
              <Link
  to="/posts-and-feeds"
  className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1"
>
  View All Posts <FiChevronsRight size={14} />
</Link>

            </div>

            {/* Create New Post / Story Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-8 shadow-sm border border-gray-200">
              <div onClick={handleOpenCreatePost} className="flex items-center gap-4 mb-4">
               {userInfo && userInfo.profileUrl ? (
    <img
      src={userInfo.profileUrl}
      alt="User Profile"
      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-primary-400 shadow-md"
    />
  ) : (
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white border-2 border-primary-400 shadow-md">
      <RiUser3Line size={24} />
    </div>
  )}
                <input
                  type="text"
                  placeholder={`Share a family moment, ${userInfo?.firstName || 'User'} ${userInfo?.lastName || ''}...`}
 
                             onClick={handleOpenCreatePost} 
                  className="flex-1 p-2 md:p-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-3 focus:ring-primary-200 focus:border-primary-300 text-gray-700 text-sm md:text-lg placeholder-gray-400"
                />
              </div>
            </div>

            {/* Recent Posts List */}
            <div className="space-y-8">
              {recentPosts.map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 md:p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img src={post.avatar} alt={post.author} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-4 border-2 border-primary-200" />
                      <div>
                        <p className="font-bold text-gray-900 text-md md:text-lg">{post.author}</p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1"><FiClock size={14} /> {post.time}</p>
                      </div>
                    </div>
                    <button className="bg-unset text-gray-400 hover:text-gray-600 transition">
                      <FiEdit3 size={18} />
                    </button>
                  </div>
                  <p className="text-gray-800 mb-5 text-sm md:text-md leading-relaxed">{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post media" className="rounded-xl w-full max-h-80 md:max-h-96 object-cover mb-5 shadow-inner border border-gray-100" />
                  )}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 text-xs md:text-sm text-gray-600">
                    <div className="flex items-center gap-4 md:gap-5">
                      <button className="bg-unset flex items-center gap-1.5 hover:text-red-600 transition font-medium group">
                        <FiHeart size={18} className="text-red-500 group-hover:scale-110 transition-transform" /> {post.likes} Likes
                      </button>
                      <button className="bg-unset flex items-center gap-1.5 hover:text-primary-600 transition font-medium group">
                        <FiMessageCircle size={18} className="group-hover:-translate-y-0.5 transition-transform" /> {post.comments} Comments
                      </button>
                    </div>
                    <button className="bg-unset flex items-center gap-1.5 hover:text-primary-600 transition font-medium group">
                      <FiShare2 size={18} className="group-hover:scale-110 transition-transform" /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Upcoming Events & Recent Gallery Uploads (Takes 1/3 on large screens, full width on small) */}
          <div className="space-y-8">
            {/* Upcoming Events Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">🎉 Upcoming Events</h2>
                <button 
                  onClick={handleViewAll}
                  className="text-primary-600 hover:text-primary-800 bg-transparent text-sm md:text-md font-medium transition duration-200 flex items-center gap-1"
                >
                  View All <FiChevronsRight size={14} />
                </button>
              </div>
               <ul className="space-y-4 text-sm text-gray-700">
        {upcomingEvents.map((event) => (
          <li
            key={event.id}
            className="flex items-center justify-between gap-4 p-3 md:p-4 rounded-lg hover:bg-primary-50 transition duration-200 border border-transparent hover:border-primary-100 group"
          >
            <div className="flex items-center gap-4">
              {event.eventImages && event.eventImages.length > 0 ? (
                <img
                  src={event.eventImages[0]}
                  alt={event.eventTitle}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span className="text-2xl md:text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  🎂
                </span>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-sm md:text-md">
                  {event.eventTitle}
                </p>
                <p className="text-xs text-gray-500">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleDateString()
                    : "No Date"}{" "}
                  • {event.eventTime}
                </p>
              </div>
            </div>
            <Link
  to="/gifts-memories"
  className="bg-unset text-primary text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline hover:text-primary-800 transition"
>
  <FiGift size={16} /> Send Gift
</Link>
          </li>
        ))}
      </ul>

            </div>

            {/* Recent Gallery Uploads Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">📸 Recent Gallery Uploads</h2>
                <Link
  to="/family-gallery"
  className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1"
>
  View Gallery <FiChevronsRight size={14} />
</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recentUploads.map(upload => (
                  <div key={upload.id} className="relative rounded-xl overflow-hidden group aspect-square shadow-sm cursor-pointer border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <img
                      src={upload.coverPhoto}
                      alt={upload.galleryTitle}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-semibold">{upload.title}</p>
                    </div>
                  </div>
                ))}
                {/* Add New Photo Card */}
                <div 
            className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer border-2 border-dashed border-primary-200 hover:border-primary-400 group"
            onClick={handleOpenCreateAlbumModal}
          >
            <FiPlusCircle size={35} className="group-hover:scale-110 transition-transform duration-200" />
          </div>
              </div>
              <p className="text-sm text-gray-500 mt-5 text-center leading-relaxed">Discover, share, and preserve your cherished family moments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={handleCloseCreateEventModal}
      />

       {/* Profile Form Modal for Adding New Member */}
      <ProfileFormModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onAddMember={handleAddMember}
        mode="add"
      />

        <CreateAlbumModal
        isOpen={isCreateAlbumModalOpen}
        onClose={handleCloseCreateAlbumModal}
        onCreateAlbum={handleAlbumCreated}
        mode="create"
         authToken={token}
      />

    {userInfo && (
  <CreatePostModal
    isOpen={isCreatePostModalOpen}
    onClose={handleCloseCreatePost}
    onPostCreated={handleCloseCreatePost}
    currentUser={userInfo}
    authToken={token}
    mode="create"
  />
)}


    </Layout>
  );
};

export default Dashboard;