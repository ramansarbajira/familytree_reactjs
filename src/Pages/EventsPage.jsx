import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import Swal from 'sweetalert2';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiPlusSquare,
  FiList,
  FiClock as FiUpcoming,
  FiLoader,
  FiImage,
  FiArrowRight,
  FiStar,
  FiGlobe,
  FiEdit3,
  FiTrash2,
  FiGift,
  FiHeart,
  FiUser,
} from 'react-icons/fi';

import CreateEventModal from '../Components/CreateEventModal';
import EventViewerModal from '../Components/EventViewerModal';
import EditEventModal from '../Components/EditEventModal';
import NoFamilyView from '../Components/NoFamilyView';
import PendingApprovalView from '../Components/PendingApprovalView';
import CreateFamilyModal from '../Components/CreateFamilyModal';
import JoinFamilyModal from '../Components/JoinFamilyModal';

const EventsPage = () => {
  const { userInfo, userLoading, refetchUserInfo } = useUser();
  
  // true = upcoming, false = my-events, 'all' = all events
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allEvents, setAllEvents] = useState([]);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEventViewerOpen, setIsEventViewerOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  const [isJoinFamilyModalOpen, setIsJoinFamilyModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch events whenever the tab changes
  useEffect(() => {
    // Only fetch events if user has family code and is approved
    if (!userInfo?.familyCode || userInfo?.approveStatus !== 'approved') {
      return;
    }

    const fetchEvents = async () => {
      setEventsLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      let endpoint;
      
      if (activeTab === 'upcoming') {
        endpoint = `${apiBaseUrl}/event/upcoming/all`;
      } else if (activeTab === 'my-events') {
        endpoint = `${apiBaseUrl}/event/my-events`;
      } else if (activeTab === 'all') {
        endpoint = `${apiBaseUrl}/event/all`;
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();

        const formattedEvents = data.map(item => {
          // Handle different event types
          let eventData = {
            id: item.id,
            title: item.eventTitle,
            description: item.eventDescription,
            date: item.eventDate,
            time: item.eventTime,
            location: item.location,
            eventType: item.eventType || 'custom',
            eventImages: 
              item.eventImages && item.eventImages.length > 0
                ? item.eventImages
                : item.images && item.images.length > 0
                  ? item.images.map(img => `${apiBaseUrl}/uploads/event/${img.imageUrl}`)
                  : [],
            attendeesCount: null,
          };

          // Add specific data for birthday and anniversary events
          if (item.eventType === 'birthday' && item.memberDetails) {
            eventData = {
              ...eventData,
              memberDetails: item.memberDetails,
              profileImage: item.memberDetails.profileImage,
              age: item.memberDetails.age,
              message: item.memberDetails.message,
            };
          } else if (item.eventType === 'anniversary' && item.memberDetails) {
            eventData = {
              ...eventData,
              memberDetails: item.memberDetails,
              profileImage: item.memberDetails.profileImage,
              spouseName: item.memberDetails.spouseName,
              yearsOfMarriage: item.memberDetails.yearsOfMarriage,
              message: item.memberDetails.message,
            };
          }

          return eventData;
        });

        setAllEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab, userInfo?.familyCode, userInfo?.approveStatus]);

  const handleCreateEventClick = () => setIsCreateEventModalOpen(true);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsEventViewerOpen(true);
  };

  const handleCloseEventViewer = () => {
    setIsEventViewerOpen(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = () => {
    setIsEventViewerOpen(false);
    setIsEditEventModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditEventModalOpen(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this event? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const deleteEndpoint = `${apiBaseUrl}/event/${selectedEvent.id}`;

      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete event API error:', errorText);
        Swal.fire({
          icon: 'error',
          title: 'Delete Event Error',
          text: `Delete Event Error: ${response.status} - ${errorText}`,
          confirmButtonColor: '#d33',
        });
        return;
      }

      console.log('✅ Event deleted successfully');
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Event has been deleted successfully.',
        confirmButtonColor: '#10b981',
      });
      
      // Close the viewer and refresh events
      setIsEventViewerOpen(false);
      setSelectedEvent(null);
      
      // Trigger a re-fetch of events
      const fetchEvents = async () => {
        const endpoint = `${apiBaseUrl}/event/my-events`;
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }
          const data = await response.json();

          const formattedEvents = data.map(item => {
            // Handle different event types
            let eventData = {
              id: item.id,
              title: item.eventTitle,
              description: item.eventDescription,
              date: item.eventDate,
              time: item.eventTime,
              location: item.location,
              eventType: item.eventType || 'custom',
              eventImages: 
                item.eventImages && item.eventImages.length > 0
                  ? item.eventImages
                  : item.images && item.images.length > 0
                    ? item.images.map(img => `${apiBaseUrl}/uploads/event/${img.imageUrl}`)
                    : [],
              attendeesCount: null,
            };

            // Add specific data for birthday and anniversary events
            if (item.eventType === 'birthday' && item.memberDetails) {
              eventData = {
                ...eventData,
                memberDetails: item.memberDetails,
                profileImage: item.memberDetails.profileImage,
                age: item.memberDetails.age,
                message: item.memberDetails.message,
              };
            } else if (item.eventType === 'anniversary' && item.memberDetails) {
              eventData = {
                ...eventData,
                memberDetails: item.memberDetails,
                profileImage: item.memberDetails.profileImage,
                spouseName: item.memberDetails.spouseName,
                yearsOfMarriage: item.memberDetails.yearsOfMarriage,
                message: item.memberDetails.message,
              };
            }

            return eventData;
          });

          setAllEvents(formattedEvents);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error deleting event',
        text: `Error deleting event: ${error.message}`,
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleEventUpdated = () => {
    // Refresh events after update
    const fetchEvents = async () => {
      setEventsLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const endpoint = `${apiBaseUrl}/event/my-events`;
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();

        const formattedEvents = data.map(item => {
          // Handle different event types
          let eventData = {
            id: item.id,
            title: item.eventTitle,
            description: item.eventDescription,
            date: item.eventDate,
            time: item.eventTime,
            location: item.location,
            eventType: item.eventType || 'custom',
            eventImages: 
              item.eventImages && item.eventImages.length > 0
                ? item.eventImages
                : item.images && item.images.length > 0
                  ? item.images.map(img => `${apiBaseUrl}/uploads/event/${img.imageUrl}`)
                  : [],
            attendeesCount: null,
          };

          // Add specific data for birthday and anniversary events
          if (item.eventType === 'birthday' && item.memberDetails) {
            eventData = {
              ...eventData,
              memberDetails: item.memberDetails,
              profileImage: item.memberDetails.profileImage,
              age: item.memberDetails.age,
              message: item.memberDetails.message,
            };
          } else if (item.eventType === 'anniversary' && item.memberDetails) {
            eventData = {
              ...eventData,
              memberDetails: item.memberDetails,
              profileImage: item.memberDetails.profileImage,
              spouseName: item.memberDetails.spouseName,
              yearsOfMarriage: item.memberDetails.yearsOfMarriage,
              message: item.memberDetails.message,
            };
          }

          return eventData;
        });

        setAllEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  };

  const handleCreateFamily = () => {
    setIsCreateFamilyModalOpen(true);
  };

  const handleJoinFamily = (familyCode = null) => {
    if (familyCode) {
      // Handle joining with specific family code
      console.log('Joining family with code:', familyCode);
      // TODO: Implement API call to join family with new code
      // For now, just show the modal
      setIsJoinFamilyModalOpen(true);
    } else {
      setIsJoinFamilyModalOpen(true);
    }
  };

  const handleFamilyJoined = (familyData) => {
    // Refresh user info to get updated family code and approval status
    refetchUserInfo().then(() => {
      setIsJoinFamilyModalOpen(false);
      // Reload the page to reflect the changes
      window.location.reload();
    });
  };

  const handleFamilyCreated = (newFamilyDetails) => {
    // Refresh user info to get updated family code and approval status
    refetchUserInfo();
    
    setIsCreateFamilyModalOpen(false);
  };

  const displayedEvents = allEvents;

  // Helper function to get event type styling
  const getEventTypeStyle = (eventType) => {
    switch (eventType) {
      case 'birthday':
        return {
          bgColor: 'bg-pink-500',
          textColor: 'text-pink-600',
          icon: FiGift,
          label: 'BIRTHDAY',
          borderColor: 'border-pink-200',
          hoverColor: 'hover:text-pink-700',
        };
      case 'anniversary':
        return {
          bgColor: 'bg-red-500',
          textColor: 'text-red-600',
          icon: FiHeart,
          label: 'ANNIVERSARY',
          borderColor: 'border-red-200',
          hoverColor: 'hover:text-red-700',
        };
      default:
        return {
          bgColor: 'bg-primary-600',
          textColor: 'text-primary-600',
          icon: FiCalendar,
          label: 'EVENT',
          borderColor: 'border-primary-200',
          hoverColor: 'hover:text-primary-700',
        };
    }
  };

  const handleEditEventFromCard = (event, e) => {
    e.stopPropagation(); // Prevent card click
    setSelectedEvent(event);
    setIsEditEventModalOpen(true);
  };

  const handleDeleteEventFromCard = async (event, e) => {
    e.stopPropagation(); // Prevent card click
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this event? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('access_token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const deleteEndpoint = `${apiBaseUrl}/event/${event.id}`;

      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete event API error:', errorText);
        Swal.fire({
          icon: 'error',
          title: 'Delete Event Error',
          text: `Delete Event Error: ${response.status} - ${errorText}`,
          confirmButtonColor: '#d33',
        });
        return;
      }

      console.log('✅ Event deleted successfully');
      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Event has been deleted successfully.',
        confirmButtonColor: '#10b981',
      });
      // Refresh events
      const fetchEvents = async () => {
        setEventsLoading(true);
        const endpoint = `${apiBaseUrl}/event/my-events`;
        try {
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch events');
          }
          const data = await response.json();

          const formattedEvents = data.map(item => {
            // Handle different event types
            let eventData = {
              id: item.id,
              title: item.eventTitle,
              description: item.eventDescription,
              date: item.eventDate,
              time: item.eventTime,
              location: item.location,
              eventType: item.eventType || 'custom',
              eventImages: 
                item.eventImages && item.eventImages.length > 0
                  ? item.eventImages
                  : item.images && item.images.length > 0
                    ? item.images.map(img => `${apiBaseUrl}/uploads/event/${img.imageUrl}`)
                    : [],
              attendeesCount: null,
            };

            // Add specific data for birthday and anniversary events
            if (item.eventType === 'birthday' && item.memberDetails) {
              eventData = {
                ...eventData,
                memberDetails: item.memberDetails,
                profileImage: item.memberDetails.profileImage,
                age: item.memberDetails.age,
                message: item.memberDetails.message,
              };
            } else if (item.eventType === 'anniversary' && item.memberDetails) {
              eventData = {
                ...eventData,
                memberDetails: item.memberDetails,
                profileImage: item.memberDetails.profileImage,
                spouseName: item.memberDetails.spouseName,
                yearsOfMarriage: item.memberDetails.yearsOfMarriage,
                message: item.memberDetails.message,
              };
            }

            return eventData;
          });

          setAllEvents(formattedEvents);
        } catch (error) {
          console.error('Error fetching events:', error);
        } finally {
          setEventsLoading(false);
        }
      };

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error deleting event',
        text: `Error deleting event: ${error.message}`,
        confirmButtonColor: '#d33',
      });
    }
  };

  // Show loading while user data is being fetched
  if (userLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="text-6xl text-primary-600 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Loading User Data...</h2>
            <p className="text-gray-500">Please wait while we fetch your information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show NoFamilyView if user has no family code
  if (!userInfo?.familyCode) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <NoFamilyView onCreateFamily={handleCreateFamily} onJoinFamily={handleJoinFamily} />
        </div>
      </Layout>
    );
  }

  // Show PendingApprovalView if user has family code but is not approved
  if (userInfo?.familyCode && userInfo?.approveStatus !== 'approved') {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <PendingApprovalView 
            familyCode={userInfo.familyCode} 
            onJoinFamily={handleJoinFamily} 
          />
        </div>
      </Layout>
    );
  }

  // Show events content only if user has family code and is approved
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8 space-y-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <FiCalendar size={24} className="text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-primary-600 leading-tight">
                  Family Events
                </h1>
              </div>
              <p className="text-gray-600 mt-2 text-lg">
                Create, manage, and celebrate memorable moments with your family
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Birthdays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Anniversaries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Custom Events</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateEventClick}
              className="bg-primary-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-primary-700 transition-all duration-300 flex items-center gap-3 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transform hover:-translate-y-1 hover:shadow-xl"
            >
              <FiPlusSquare size={24} /> Create New Event
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex items-center gap-3 py-3 px-8 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'upcoming'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                >
                  <FiUpcoming size={20} /> 
                  <span>Upcoming Events</span>
                  {activeTab === 'upcoming' && <FiStar size={16} className="ml-1" />}
                </button>
                <button
                  onClick={() => setActiveTab('my-events')}
                  className={`flex items-center gap-3 py-3 px-8 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'my-events'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                >
                  <FiList size={20} /> 
                  <span>My Events</span>
                  {activeTab === 'my-events' && <FiStar size={16} className="ml-1" />}
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center gap-3 py-3 px-8 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'all'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                >
                  <FiGlobe size={20} /> 
                  <span>All Events</span>
                  {activeTab === 'all' && <FiStar size={16} className="ml-1" />}
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsLoading ? (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FiLoader className="text-6xl text-primary-600 animate-spin" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    Loading Events...
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Please wait while we fetch your events.
                  </p>
                </div>
              </div>
            ) : displayedEvents.length > 0 ? (
              displayedEvents.map(event => {
                const eventStyle = getEventTypeStyle(event.eventType);
                const EventIcon = eventStyle.icon;
                
                return (
                  <div
                    key={event.id}
                    className={`group bg-white rounded-2xl shadow-lg transition-all duration-300 border ${eventStyle.borderColor} overflow-hidden ${
                      event.eventType === 'custom' 
                        ? 'cursor-pointer hover:shadow-xl transform hover:scale-105' 
                        : 'cursor-default'
                    }`}
                    onClick={event.eventType === 'custom' ? () => handleViewEvent(event) : undefined}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.eventImages && event.eventImages.length > 0 ? (
                        <img
                          src={event.eventImages[0]}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/800x450/e0f2fe/0369a1?text=Event+Image";
                          }}
                        />
                      ) : event.profileImage ? (
                        <img
                          src={event.profileImage}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/800x450/e0f2fe/0369a1?text=Event+Image";
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full ${eventStyle.bgColor} flex items-center justify-center`}>
                          <EventIcon size={48} className="text-white" />
                        </div>
                      )}
                      
                      {/* Image overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Image count badge */}
                      {event.eventImages && event.eventImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                          +{event.eventImages.length - 1} photos
                        </div>
                      )}
                      
                      {/* Event type badge */}
                      <div className={`absolute top-3 left-3 ${eventStyle.bgColor} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                        <EventIcon size={12} />
                        {eventStyle.label}
                      </div>

                      {/* Special badges for birthday and anniversary */}
                      {event.eventType === 'birthday' && event.age && (
                        <div className="absolute bottom-3 right-3 bg-white/90 text-pink-600 px-2 py-1 rounded-full text-xs font-bold">
                          {event.age} years
                        </div>
                      )}
                      {event.eventType === 'anniversary' && event.yearsOfMarriage && (
                        <div className="absolute bottom-3 right-3 bg-white/90 text-red-600 px-2 py-1 rounded-full text-xs font-bold">
                          {event.yearsOfMarriage} years
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-4 space-y-3">
                      {/* Title */}
                      <h3 className={`text-lg font-bold text-gray-900 line-clamp-2 group-hover:${eventStyle.textColor} transition-colors duration-300`}>
                        {event.title}
                      </h3>

                      {/* Special message for birthday and anniversary */}
                      {event.message && (
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg">
                          "{event.message}"
                        </p>
                      )}

                      {/* Event Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className={`w-6 h-6 ${eventStyle.bgColor} rounded flex items-center justify-center flex-shrink-0`}>
                            <FiCalendar size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date & Time</p>
                            <p className="text-sm font-semibold">
                              {event.date} {event.time && `• ${event.time}`}
                            </p>
                          </div>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className={`w-6 h-6 ${eventStyle.bgColor} rounded flex items-center justify-center flex-shrink-0`}>
                              <FiMapPin size={14} className="text-white" />
                            </div>
                            <p className="text-sm font-semibold line-clamp-1">{event.location}</p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {event.attendeesCount && (
                            <div className="flex items-center gap-2">
                              <FiUsers size={14} />
                              <span className="font-medium">{event.attendeesCount}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Edit and Delete buttons - only show for My Events */}
                          {activeTab === 'my-events' && event.eventType === 'custom' && (
                            <>
                              <button
                                onClick={(e) => handleEditEventFromCard(event, e)}
                                className="bg-unset p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                                title="Edit Event"
                              >
                                <FiEdit3 size={16} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteEventFromCard(event, e)}
                                className="bg-unset p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete Event"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </>
                          )}
                          
                          {/* View button - only show for custom events */}
                          {event.eventType === 'custom' && (
                            <div className={`flex items-center gap-2 ${eventStyle.textColor} font-semibold group-hover:${eventStyle.hoverColor} transition-colors`}>
                              <span className="text-sm">View</span>
                              <FiArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="max-w-md mx-auto">
                  <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FiCalendar size={48} className="text-primary-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-primary-600 mb-4">
                    {activeTab === 'upcoming' ? "No Upcoming Events" : activeTab === 'my-events' ? "No Events Created" : "No Events Found"}
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {activeTab === 'upcoming'
                      ? "No upcoming events scheduled. Start planning your next family gathering!"
                      : activeTab === 'my-events'
                      ? "You haven't created any events yet. Begin creating memorable family moments."
                      : "No events found in the system. Be the first to create an event!"}
                  </p>
                  <button
                    onClick={handleCreateEventClick}
                    className="bg-primary-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-primary-700 transition-all duration-300 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <FiPlusSquare size={24} className="inline mr-3" />
                    Create Your First Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />
      <EventViewerModal
        isOpen={isEventViewerOpen}
        onClose={handleCloseEventViewer}
        event={selectedEvent}
        isMyEvent={activeTab === 'my-events'}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={handleCloseEditModal}
        event={selectedEvent}
        onEventUpdated={handleEventUpdated}
      />

      <CreateFamilyModal
        isOpen={isCreateFamilyModalOpen}
        onClose={() => setIsCreateFamilyModalOpen(false)}
        onFamilyCreated={handleFamilyCreated}
        token={localStorage.getItem('access_token')}
      />

      <JoinFamilyModal
        isOpen={isJoinFamilyModalOpen}
        onClose={() => setIsJoinFamilyModalOpen(false)}
        onFamilyJoined={handleFamilyJoined}
        token={localStorage.getItem('access_token')}
        refetchUserInfo={refetchUserInfo}
      />
    </Layout>
  );
};

export default EventsPage;
