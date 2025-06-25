import React from 'react';
import Layout from '../Components/Layout';
import { FiUsers, FiCalendar, FiGift, FiImage, FiPlusCircle, FiShare2, FiHeart, FiMessageCircle, FiEdit3, FiPaperclip, FiTag, FiClock, FiSettings, FiChevronsRight, FiBell, FiSearch } from 'react-icons/fi'; // Added more icons for future use and refinement

const Dashboard = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // --- RELIABLE LOREM PICSUM IMAGE LINKS ---
  const currentUserAvatar = "https://picsum.photos/seed/user1/300/300"; // Unique seed for current user

  const upcomingEvents = [
    { id: 1, name: "Mom's Birthday", date: "June 21", icon: '🎂', time: "6:00 PM" },
    { id: 2, name: "Parents Anniversary", date: "June 25", icon: '💍', time: "1:00 PM" },
    { id: 3, name: "Uncle Raj's Birthday", date: "July 01", icon: '🎈', time: "7:30 PM" },
  ];

  const recentUploads = [
    { id: 1, title: "Family Picnic", time: "5 days ago", imageUrl: "https://picsum.photos/seed/picnic/600/400" },
    { id: 2, title: "Diwali Celebration", time: "2 weeks ago", imageUrl: "https://picsum.photos/seed/diwali/600/400" },
    { id: 3, title: "Grandpa's 80th Birthday", time: "1 month ago", imageUrl: "https://picsum.photos/seed/grandpa/600/400" },
  ];

  const recentPosts = [
    {
      id: 1,
      author: "Sabarinath_Rajendran29",
      avatar: currentUserAvatar,
      time: "2 hours ago",
      content: "Just shared some old family photos! Reliving those golden memories. So much fun. Browse through them. #FamilyMemories #Throwback",
      image: "https://picsum.photos/seed/post1/800/500", // Larger image for post content
      likes: 15,
      comments: 3
    },
    {
      id: 2,
      author: "Priya Sharma",
      avatar: "https://picsum.photos/seed/user2/300/300", // Unique seed for Priya
      time: "Yesterday",
      content: "Counting down to Mom's birthday! Planning a surprise party. Any gift ideas? 🎁🥳 #MomsBirthday #FamilyLove",
      image: "", // No image for this post
      likes: 8,
      comments: 5
    }
  ];

  return (
    <Layout>
      {/* Main Content Wrapper - Responsive Padding */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-10">

        {/* Dashboard Header - Enhanced with Search and Notifications */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex-grow">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Your Family Hub</h1>
            <p className="text-gray-600 mt-2 text-lg">Welcome, Sabarinath! Here's what's happening today, <span className="font-semibold text-primary-700">{formattedDate}</span>.</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search family moments..."
                className="pl-8 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-300 w-full sm:w-64 text-sm"
              />
              <FiSearch className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {/* Notifications Button */}
            <button className="relative p-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75">
              <FiBell size={20} />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            {/* Dashboard Settings Button - Clearer purpose and primary styling */}
            <button className="bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-lg hover:bg-primary-700 transition duration-300 flex items-center gap-2 font-medium text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75">
              <FiSettings size={18} /> Settings
            </button>
          </div>
        </div>

        {/* NEW IMPROVED OVERVIEW CARDS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Member Count Card - Highlighted with glass morphism effect */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl p-6 relative overflow-hidden group transform hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <FiUsers className="text-black opacity-90" size={40} />
                <span className="text-black/80 text-sm font-medium tracking-wide">FAMILY</span>
              </div>
              <div>
                <h2 className="text-4xl font-bold text-black mb-1">12</h2>
                <p className="text-black/80 text-sm">Family Members</p>
                <div className="w-full bg-black/30 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-black h-full w-3/4 rounded-full"></div>
                </div>
                <button className="bg-unset mt-4 text-xs font-medium text-primary hover:text-white/80 transition-colors flex items-center">
                  Manage Members <FiChevronsRight size={14} className="ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Events Card - With subtle animation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:translate-y-[-5px]">
            <div className="flex items-center justify-between mb-4">
              <FiCalendar className="text-primary-600" size={40} />
              <span className="text-gray-500 text-sm font-medium tracking-wide">EVENTS</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-1">3</h2>
              <p className="text-gray-500 text-sm">Upcoming Events</p>
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
              <button className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors flex items-center">
                View Calendar <FiChevronsRight size={14} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Gifts Card - With interactive element */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <FiGift className="text-primary-600" size={40} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                  2
                </span>
              </div>
              <span className="text-gray-500 text-sm font-medium tracking-wide">GIFTS</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-1">2</h2>
              <p className="text-gray-500 text-sm">Sent this month</p>
              <button className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors flex items-center">
                Track Gifts <FiChevronsRight size={14} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Gallery Card - With image preview effect */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group transform hover:translate-y-[-5px]">
            <div className="flex items-center justify-between mb-4">
              <FiImage className="text-primary-600" size={40} />
              <span className="text-gray-500 text-sm font-medium tracking-wide">GALLERY</span>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-1">5</h2>
              <p className="text-gray-500 text-sm">Recent Uploads</p>
              <div className="flex -space-x-2 mt-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div 
                    key={item}
                    className="w-9 h-9 rounded-full border-2 border-white shadow-sm bg-gray-200 overflow-hidden transform group-hover:-translate-y-1 transition-transform duration-200"
                    style={{ transitionDelay: `${item * 50}ms` }}
                  >
                    <img 
                      src={`https://picsum.photos/seed/gallery${item}/200/200`} 
                      alt="Gallery thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <button className="bg-unset text-primary mt-4 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors flex items-center">
                Browse Gallery <FiChevronsRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Responsive Grid, all Primary Themed, with subtle animations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <button className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiPlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" /> <span className="font-semibold">Add New Member</span>
          </button>
          <button className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiImage size={20} className="group-hover:scale-110 transition-transform duration-300" /> <span className="font-semibold">Upload Photo</span>
          </button>
          <button className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiGift size={20} className="group-hover:animate-bounce-once transition-transform duration-300" /> <span className="font-semibold">Send a Gift</span>
          </button>
          <button className="bg-primary-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-lg hover:bg-primary-700 transition duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 text-sm sm:text-base group">
            <FiCalendar size={20} className="group-hover:rotate-6 transition-transform duration-300" /> <span className="font-semibold">Schedule Event</span>
          </button>
        </div>

        {/* Main Content Area: Posts & Activities - Responsive Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recent Posts / Activity Feed (Takes 2/3 on large screens, full width on small) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Family Activity Feed</h2>
              <a href="#" className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1">View All Posts <FiChevronsRight size={14} /></a>
            </div>

            {/* Create New Post / Story Card */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-5 mb-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <img src={currentUserAvatar} alt="Your Avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-primary-400 shadow-md" />
                <input
                  type="text"
                  placeholder="Share a family moment, Sabarinath..."
                  className="flex-1 p-2 md:p-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-3 focus:ring-primary-200 focus:border-primary-300 text-gray-700 text-sm md:text-lg placeholder-gray-400"
                />
              </div>
              <div className="flex flex-wrap justify-around border-t border-gray-200 pt-4 gap-2">
                <button className="bg-unset flex items-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-2 transition text-xs md:text-sm font-medium">
                  <FiImage size={18} /> Photo/Video
                </button>
                <button className="bg-unset flex items-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-2 transition text-xs md:text-sm font-medium">
                  <FiTag size={18} /> Tag Family
                </button>
                <button className="bg-unset flex items-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-2 transition text-xs md:text-sm font-medium">
                  <FiCalendar size={18} /> Create Event
                </button>
                <button className="bg-unset flex items-center gap-2 text-primary-600 hover:bg-primary-50 rounded-lg px-3 py-2 transition text-xs md:text-sm font-medium">
                  <FiPaperclip size={18} /> Add Document
                </button>
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
                <a href="#" className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1">View All <FiChevronsRight size={14} /></a>
              </div>
              <ul className="space-y-4 text-sm text-gray-700">
                {upcomingEvents.map(event => (
                  <li key={event.id} className="flex items-center justify-between gap-4 p-3 md:p-4 rounded-lg hover:bg-primary-50 transition duration-200 border border-transparent hover:border-primary-100 group">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl md:text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">{event.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-md">{event.name}</p>
                        <p className="text-xs text-gray-500">{event.date} • {event.time}</p>
                      </div>
                    </div>
                    <button className="bg-unset text-primary text-sm text-primary-600 font-medium flex items-center gap-1 hover:underline hover:text-primary-800 transition">
                      <FiGift size={16} /> Send Gift
                    </button>
                  </li>
                ))}
              </ul>

            </div>

            {/* Recent Gallery Uploads Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-7 border border-gray-100">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">📸 Recent Gallery Uploads</h2>
                <a href="#" className="text-primary-600 hover:text-primary-800 text-sm md:text-md font-medium transition duration-200 flex items-center gap-1">View Gallery <FiChevronsRight size={14} /></a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recentUploads.map(upload => (
                  <div key={upload.id} className="relative rounded-xl overflow-hidden group aspect-square shadow-sm cursor-pointer border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <img
                      src={upload.imageUrl}
                      alt={upload.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-xs font-semibold">{upload.title}</p>
                    </div>
                  </div>
                ))}
                {/* Add New Photo Card */}
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer border-2 border-dashed border-primary-200 hover:border-primary-400 group">
                  <FiPlusCircle size={35} className="group-hover:scale-110 transition-transform duration-200" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-5 text-center leading-relaxed">Discover, share, and preserve your cherished family moments.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;