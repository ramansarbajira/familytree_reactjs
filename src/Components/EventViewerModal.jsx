import React from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';

const EventViewerModal = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative transform transition-all scale-100 opacity-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors z-10"
                    title="Close"
                >
                    <FiX size={24} />
                </button>

                {/* Event Image / Banner */}
                {event.imageUrl && (
                    <div className="w-full h-48 sm:h-64 overflow-hidden rounded-t-2xl">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Event Details */}
                <div className="p-6 flex-grow overflow-y-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h2>

                    <div className="space-y-2 text-gray-700 mb-6">
                        <div className="flex items-center gap-3">
                            <FiCalendar size={20} className="text-primary-600" />
                            <span className="text-lg">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiClock size={20} className="text-primary-600" />
                            <span className="text-lg">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FiMapPin size={20} className="text-primary-600" />
                            <span className="text-lg">{event.location}</span>
                        </div>
                        {event.attendeesCount && (
                            <div className="flex items-center gap-3">
                                <FiUsers size={20} className="text-primary-600" />
                                <span className="text-lg">{event.attendeesCount} Attendees</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {event.description || "No description provided for this event."}
                    </p>

                    {/* RSVP / Join Button (Optional) */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75">
                            RSVP / Mark as Attending
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventViewerModal;
