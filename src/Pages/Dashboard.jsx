import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext'; 
import CreateEventModal from '../Components/CreateEventModal'; // Import your modal component
import ProfileFormModal from '../Components/ProfileFormModal';
import { FiUsers, FiCalendar, FiGift, FiImage, FiPlusCircle, FiShare2, FiHeart, FiMessageCircle, FiEdit3, FiPaperclip, FiTag, FiClock, FiSettings, FiChevronsRight, FiBell, FiSearch, FiLoader } from 'react-icons/fi';
import CreateAlbumModal from '../Components/CreateAlbumModal';
import CreatePostModal from '../Components/CreatePostModal';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { RiUser3Line } from 'react-icons/ri';
import Swal from 'sweetalert2';

const Dashboard = ({ apiBaseUrl = import.meta.env.VITE_API_BASE_URL }) => {
  // State for modal visibility
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateAlbumModalOpen, setIsCreateAlbumModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(null);
  const { userInfo } = useUser();
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const [galleryCount, setGalleryCount] = useState(null);
  const [familyStats, setFamilyStats] = useState(null);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [latestPhotos, setLatestPhotos] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCountSectionLoading, setIsCountSectionLoading] = useState(true);

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

        // Check if data is an array or has a data property
        let postsArray = [];
        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          postsArray = data.data;
        }

        // Latest date first, then slice first 5
        const sortedPosts = postsArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

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
        setRecentPosts([]);
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
        setFamilyStats({ totalMembers: 0 });
      });
  }
}, [apiBaseUrl, userInfo?.familyCode, token]);

  // Fetch upcoming birthdays
  useEffect(() => {
    if (token) {
      fetch(`${apiBaseUrl}/event/upcoming/birthdays`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Birthdays data:', data);
          if (Array.isArray(data)) {
            setUpcomingBirthdays(data.slice(0, 3)); // Show first 3 birthdays
          } else {
            setUpcomingBirthdays([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching birthdays:", err);
          setUpcomingBirthdays([]);
        });
    }
  }, [apiBaseUrl, token]);

  // Fetch upcoming anniversaries
  useEffect(() => {
    if (token) {
      fetch(`${apiBaseUrl}/event/upcoming/anniversaries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Anniversaries data:', data);
          if (Array.isArray(data)) {
            setUpcomingAnniversaries(data.slice(0, 3)); // Show first 3 anniversaries
          } else {
            setUpcomingAnniversaries([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching anniversaries:", err);
          setUpcomingAnniversaries([]);
        });
    }
  }, [apiBaseUrl, token]);

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
        console.log('Gallery data:', data);
        
        // Check if data is an array or has a data property
        let galleryArray = [];
        if (Array.isArray(data)) {
          galleryArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          galleryArray = data.data;
        }

        setGalleryCount(galleryArray.length);
        const latestFive = galleryArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setLatestPhotos(latestFive);

        // For this section: take last 3 (most recent)
        const latestThree = galleryArray
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setRecentUploads(latestThree);
      })
      .catch((error) => {
        console.error('Error fetching gallery data:', error);
        setGalleryCount(0);
        setLatestPhotos([]);
        setRecentUploads([]);
      });
  }
}, [apiBaseUrl, userInfo?.familyCode, token]);

useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Set loading to false when userInfo and token are available
  useEffect(() => {
    if (userInfo && token) {
      setIsLoading(false);
    }
  }, [userInfo, token]);

  // Set count section loading to false when all count data is available
  useEffect(() => {
    if (familyStats !== null && upcomingEventsCount !== null && galleryCount !== null) {
      setIsCountSectionLoading(false);
    }
  }, [familyStats, upcomingEventsCount, galleryCount]);

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
    if (token) {
      fetch(`${apiBaseUrl}/event/upcoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Upcoming events count data:', data);
          // Check if data is an array or has a data property
          let eventsArray = [];
          if (Array.isArray(data)) {
            eventsArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            eventsArray = data.data;
          }
          setUpcomingEventsCount(eventsArray.length);
        })
        .catch((error) => {
          console.error('Error fetching upcoming events:', error);
          setUpcomingEventsCount(0);
        });
    }
  }, [apiBaseUrl, token]);


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


  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="text-6xl text-primary-600 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading Dashboard...</h2>
            <p className="text-gray-500">Please wait while we fetch your family information.</p>
          </div>
        </div>
      </Layout>
    );
  }

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
        {isCountSectionLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gray-300 h-full w-3/4 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">
              {familyStats?.totalMembers ?? '0'}
            </h2>
            <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Family Members</p>
            <div className="w-full bg-gray-200 group-hover:bg-black/30 h-1.5 rounded-full mt-3 overflow-hidden transition-colors duration-300">
              <div className="bg-primary-600 group-hover:bg-black h-full w-3/4 rounded-full transition-colors duration-300"></div>
            </div>
          </>
        )}
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
        {isCountSectionLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="flex space-x-1 mt-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-6 h-6 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
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
          {!isCountSectionLoading && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              2
            </span>
          )}
        </div>
        <span className="text-gray-500 group-hover:text-black/80 text-sm font-medium tracking-wide transition-colors duration-300">GIFTS</span>
      </div>
      <div>
        {isCountSectionLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ) : (
          <>
            <h2 className="text-4xl font-bold text-gray-800 group-hover:text-black mb-1 transition-colors duration-300">2</h2>
            <p className="text-gray-500 group-hover:text-black/80 text-sm transition-colors duration-300">Sent this month</p>
          </>
        )}
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
        {isCountSectionLoading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="flex -space-x-2 mt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-gray-300 border-2 border-white"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}

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
             {/* Show Add New Member button only for Admin (role 2) and Superadmin (role 3) */}
             {(userInfo?.role === 2 || userInfo?.role === 3) && (
               <button 
                 onClick={handleOpenProfileModal}
                 className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group"
               >
                 <FiPlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
                 <span className="font-semibold">Add New Member</span>
               </button>
             )}
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 max-h-[800px] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Family Activity Feed</h2>
              <Link
                to="/posts-and-feeds"
                className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1 hover:scale-105 transform"
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
            <div className="space-y-6">
              {recentPosts.length > 0 ? (
                recentPosts.map(post => (
                  <div key={post.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 hover:shadow-md hover:border-primary-200 transition-all duration-300 group">
                    <div className="flex items-center mb-4">
                      <img src={post.avatar} alt={post.author} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mr-4 border-2 border-primary-200 shadow-sm" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-md md:text-lg">{post.author}</p>
                        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1"><FiClock size={14} /> {post.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-4 text-sm md:text-md leading-relaxed">{post.content}</p>
                    {post.image && (
                      <img src={post.image} alt="Post media" className="rounded-lg w-full max-h-64 md:max-h-80 object-cover mb-4 shadow-sm border border-gray-100" />
                    )}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-4 md:gap-5">
                        <button className="bg-unset flex items-center gap-1.5 hover:text-red-600 transition font-medium group">
                          <FiHeart size={16} className="text-red-500 group-hover:scale-110 transition-transform" /> {post.likes} Likes
                        </button>
                        <button className="bg-unset flex items-center gap-1.5 hover:text-primary-600 transition font-medium group">
                          <FiMessageCircle size={16} className="group-hover:-translate-y-0.5 transition-transform" /> {post.comments} Comments
                        </button>
                      </div>
                      <button className="bg-unset flex items-center gap-1.5 hover:text-primary-600 transition font-medium group">
                        <FiShare2 size={16} className="group-hover:scale-110 transition-transform" /> Share
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Yet</h3>
                  <p className="text-gray-500 text-sm mb-6">Be the first to share a family moment!</p>
                  <button 
                    onClick={handleOpenCreatePost}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
                  >
                    <FiPlusCircle size={18} />
                    Create First Post
                  </button>
                </div>
              )}
              
              {/* View More Button */}
              {recentPosts.length > 0 && (
                <div className="text-center pt-4 border-t border-gray-100">
                  <Link
                    to="/posts-and-feeds"
                    className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 hover:scale-105 transform shadow-md hover:shadow-lg"
                  >
                    View All Posts
                    <FiChevronsRight size={16} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upcoming Birthdays & Wedding Anniversaries (Takes 1/3 on large screens, full width on small) */}
          <div className="space-y-8">
            {/* Upcoming Birthdays Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">🎂 Upcoming Birthdays</h2>
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1"
                >
                  View All <FiChevronsRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingBirthdays.length > 0 ? (
                  upcomingBirthdays.map((birthday) => (
                    <div
                      key={birthday.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 transition duration-300 border border-transparent hover:border-pink-200 group"
                    >
                      <div className="flex items-center gap-4">
                        {birthday.memberDetails?.profileImage ? (
                          <img
                            src={birthday.memberDetails.profileImage}
                            alt={`${birthday.memberDetails.firstName} ${birthday.memberDetails.lastName}`}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-pink-200 shadow-md group-hover:border-pink-300 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                            {birthday.memberDetails?.firstName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {birthday.memberDetails?.firstName} {birthday.memberDetails?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiCalendar size={12} />
                            {birthday.eventDate ? new Date(birthday.eventDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            }) : "Date TBD"}
                            {birthday.memberDetails?.age && (
                              <span className="ml-2 px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                                {birthday.memberDetails.age} years
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/gifts-memories"
                        className="bg-unset text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1 hover:underline transition-colors group-hover:scale-105"
                      >
                        <FiGift size={16} /> Gift
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎂</div>
                    <p className="text-gray-500 text-sm">No upcoming birthdays</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wedding Anniversaries Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">💕 Wedding Anniversaries</h2>
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1"
                >
                  View All <FiChevronsRight size={14} />
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingAnniversaries.length > 0 ? (
                  upcomingAnniversaries.map((anniversary) => (
                    <div
                      key={anniversary.id}
                      className="flex items-center justify-between gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition duration-300 border border-transparent hover:border-purple-200 group"
                    >
                      <div className="flex items-center gap-4">
                        {anniversary.memberDetails?.profileImage ? (
                          <img
                            src={anniversary.memberDetails.profileImage}
                            alt={`${anniversary.memberDetails.firstName} ${anniversary.memberDetails.lastName}`}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-purple-200 shadow-md group-hover:border-purple-300 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md">
                            {anniversary.memberDetails?.firstName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {anniversary.memberDetails?.firstName} & {anniversary.memberDetails?.spouseName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FiCalendar size={12} />
                            {anniversary.eventDate ? new Date(anniversary.eventDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            }) : "Date TBD"}
                            {anniversary.memberDetails?.yearsOfMarriage && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                {anniversary.memberDetails.yearsOfMarriage} years
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/gifts-memories"
                        className="bg-unset text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 hover:underline transition-colors group-hover:scale-105"
                      >
                        <FiGift size={16} /> Gift
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">💕</div>
                    <p className="text-gray-500 text-sm">No upcoming anniversaries</p>
                  </div>
                )}
              </div>
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