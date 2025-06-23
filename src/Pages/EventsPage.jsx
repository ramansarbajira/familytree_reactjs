import React, { useState } from 'react';
import Layout from '../Components/Layout';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiPlusSquare, FiList, FiClock as FiUpcoming } from 'react-icons/fi'; // Renamed FiClock for clarity in imports

import CreateEventModal from '../Components/CreateEventModal';
import EventViewerModal from '../Components/EventViewerModal';

const EventsPage = () => {
    const [showUpcomingEvents, setShowUpcomingEvents] = useState(true); // true for upcoming, false for all
    const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
    const [isEventViewerOpen, setIsEventViewerOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Placeholder Event Data
    const [allEvents, setAllEvents] = useState([
        {
            id: 1,
            title: "Family Summer BBQ",
            date: "2025-07-20",
            time: "15:00",
            location: "Grandparents' Backyard",
            description: "Join us for a fun-filled summer BBQ! Delicious food, games, and great company. Don't forget your swimsuits!",
            imageUrl: "https://picsum.photos/seed/bbqEvent/800/450",
            attendeesCount: 15,
        },
        {
            id: 2,
            title: "Cousin's Birthday Party",
            date: "2025-08-10",
            time: "18:30",
            location: "Kids Fun Zone",
            description: "Celebrating Rohan's 5th birthday! Come for cake, games, and lots of laughter.",
            imageUrl: "https://picsum.photos/seed/birthdayEvent/800/450",
            attendeesCount: 10,
        },
        {
            id: 3,
            title: "Annual Family Picnic",
            date: "2025-09-05", // A future event
            time: "12:00",
            location: "City Park East",
            description: "Our annual gathering! Bring your favorite dish to share and enjoy the outdoors.",
            imageUrl: "https://picsum.photos/seed/picnicEvent/800/450",
            attendeesCount: 20,
        },
        {
            id: 4,
            title: "Diwali Celebration 2025",
            date: "2025-10-31", // A future event
            time: "19:00",
            location: "Community Hall",
            description: "Let's light up the night with our Diwali celebrations! Fireworks, traditional food, and music.",
            imageUrl: "https://picsum.photos/seed/diwaliEvent/800/450",
            attendeesCount: 30,
        },
        {
            id: 5,
            title: "Christmas Dinner",
            date: "2024-12-25", // A past event
            time: "19:00",
            location: "Home",
            description: "A cozy Christmas dinner with carols and gift exchange. Merry Christmas everyone!",
            imageUrl: "https://picsum.photos/seed/christmasEvent/800/450",
            attendeesCount: 12,
        },
        {
            id: 6,
            title: "New Year's Eve Bash",
            date: "2024-12-31", // A past event
            time: "20:00",
            location: "Clubhouse Party Room",
            description: "Ring in the New Year with friends and family! Music, dancing, and a countdown.",
            imageUrl: "https://picsum.photos/seed/newYearEvent/800/450",
            attendeesCount: 25,
        },
    ]);

    const getFilteredEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        if (showUpcomingEvents) {
            return allEvents.filter(event => new Date(event.date) >= today)
                             .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date
        }
        return allEvents.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort all by newest first
    };

    const displayedEvents = getFilteredEvents();

    const handleCreateEventClick = () => setIsCreateEventModalOpen(true);

    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setIsEventViewerOpen(true);
    };

    const handleCloseEventViewer = () => {
        setIsEventViewerOpen(false);
        setSelectedEvent(null);
    };

    return (
        <Layout>
            <div className="mx-auto px-4 py-4 md:px-6 lg:px-8 space-y-8 font-inter">
                {/* Events Header Section */}
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

                {/* Event Toggles */}
                <div className="flex justify-center items-center gap-4 bg-white rounded-xl shadow-sm p-2 md:p-3 border border-gray-100">
                    <button
                        onClick={() => setShowUpcomingEvents(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                            showUpcomingEvents ? 'bg-primary-100 text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FiUpcoming size={20} /> Upcoming Events
                    </button>

                    <span className="text-gray-300 mx-2">|</span> {/* Separator */}

                    <button
                        onClick={() => setShowUpcomingEvents(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                            !showUpcomingEvents ? 'bg-primary-100 text-primary-700 shadow' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <FiList size={20} /> All Events
                    </button>
                </div>

                {/* Events Display Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedEvents.length > 0 ? (
                        displayedEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100
                                           transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer"
                                onClick={() => handleViewEvent(event)}
                            >
                                <div className="relative w-full h-48 overflow-hidden">
                                    <img
                                        src={event.imageUrl || `https://placehold.co/800x450/e0f2fe/0369a1?text=Event+${event.id}`}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x450/e0f2fe/0369a1?text=Event+Image"; }}
                                    />
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
                                {showUpcomingEvents ? "No upcoming events. Plan your next gathering!" : "No events created yet."}
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
