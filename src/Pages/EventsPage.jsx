import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiPlusSquare,
  FiList,
  FiClock as FiUpcoming,
} from 'react-icons/fi';

import CreateEventModal from '../Components/CreateEventModal';
import EventViewerModal from '../Components/EventViewerModal';

const EventsPage = () => {
  const [showUpcomingEvents, setShowUpcomingEvents] = useState(true); // true = upcoming, false = all
  const [allEvents, setAllEvents] = useState([]);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isEventViewerOpen, setIsEventViewerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // ✅ Fetch events whenever the toggle changes
  useEffect(() => {
    const fetchEvents = async () => {
      const endpoint = showUpcomingEvents
        ? 'https://familytree-backend-trs6.onrender.com/event/upcoming'
        : 'https://familytree-backend-trs6.onrender.com/event/all';

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();

        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.eventTitle,
          description: item.eventDescription,
          date: item.eventDate,
          time: item.eventTime,
          location: item.location,
          eventImages: item.eventImages || [], // ✅ KEEP ALL IMAGES!
          attendeesCount: null, // If you have attendees, map it here
        }));

        setAllEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [showUpcomingEvents]);

  const handleCreateEventClick = () => setIsCreateEventModalOpen(true);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsEventViewerOpen(true);
  };

  const handleCloseEventViewer = () => {
    setIsEventViewerOpen(false);
    setSelectedEvent(null);
  };

  const displayedEvents = allEvents;

  return (
    <Layout>
      <div className="mx-auto px-4 py-4 md:px-6 lg:px-8 space-y-8 font-inter">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">Family Events</h1>
            <p className="text-lg text-gray-600">Keep track of all your memorable family gatherings.</p>
          </div>
          <button
            onClick={handleCreateEventClick}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-primary-700 transition duration-300 flex items-center gap-2 font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
          >
            <FiPlusSquare size={20} /> Create New Event
          </button>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center items-center gap-4 bg-white rounded-xl shadow-sm p-2 md:p-3 border border-gray-100">
          <button
            onClick={() => setShowUpcomingEvents(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              showUpcomingEvents
                ? 'bg-primary-100 text-primary-700 shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiUpcoming size={20} /> Upcoming Events
          </button>

          <span className="text-gray-300 mx-2">|</span>

          <button
            onClick={() => setShowUpcomingEvents(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              !showUpcomingEvents
                ? 'bg-primary-100 text-primary-700 shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FiList size={20} /> All Events
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100
                           transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleViewEvent(event)}
              >
                <div className="relative w-full overflow-hidden">
                  {event.eventImages && event.eventImages.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto w-full h-48 p-2">
                      {event.eventImages.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={`Event ${event.id} Image ${index + 1}`}
                          className="object-cover h-44 w-auto rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/800x450/e0f2fe/0369a1?text=Event+Image";
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={`https://placehold.co/800x450/e0f2fe/0369a1?text=Event+${event.id}`}
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center text-gray-700 text-sm">
                    <FiCalendar size={16} className="mr-2 text-primary-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-gray-700 text-sm">
                    <FiClock size={16} className="mr-2 text-primary-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700 text-sm">
                    <FiMapPin size={16} className="mr-2 text-primary-500" />
                    <span>{event.location}</span>
                  </div>
                  {event.attendeesCount && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <FiUsers size={16} className="mr-2 text-gray-500" />
                      <span>{event.attendeesCount} Attendees</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-3 text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg mb-4">
                {showUpcomingEvents
                  ? "No upcoming events. Plan your next gathering!"
                  : "No events created yet."}
              </p>
              <button
                onClick={handleCreateEventClick}
                className="bg-primary-500 text-white px-8 py-3 rounded-full shadow hover:bg-primary-600 transition-colors text-base font-medium"
              >
                Create Your First Event
              </button>
            </div>
          )}
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
      />
    </Layout>
  );
};

export default EventsPage;
