import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';

const EventViewerModal = ({ isOpen, onClose, event }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (event?.eventImages && event.eventImages.length > 0) {
      setActiveIndex(0); // Reset to first image when opening
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const images = event.eventImages || [];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col relative transform transition-all scale-100 opacity-100 overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors z-10"
          title="Close"
        >
          <FiX size={24} />
        </button>

        {/* Big Active Image */}
        {images.length > 0 && (
          <div className="relative w-full h-80 sm:h-[28rem] bg-black">
            <img
              src={images[activeIndex]}
              alt={`Event Image ${activeIndex + 1}`}
              className="w-full h-full object-contain rounded-t-2xl"
            />

            {/* Prev / Next buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80"
                >
                  &lt;
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-80"
                >
                  &gt;
                </button>
              </>
            )}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-4 bg-gray-50">
            {images.map((imgUrl, index) => (
              <img
                key={index}
                src={imgUrl}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-20 w-32 object-cover rounded-lg cursor-pointer border-2 ${
                  index === activeIndex ? 'border-primary-500' : 'border-transparent'
                }`}
              />
            ))}
          </div>
        )}

        {/* Event Details */}
        <div className="p-6 flex-grow">
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

          {/* RSVP Button (Optional) */}
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
