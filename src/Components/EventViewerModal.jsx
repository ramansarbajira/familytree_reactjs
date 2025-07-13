import React, { useState, useEffect, useCallback } from 'react';
import {
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiMessageCircle,
  FiEdit3,
  FiTrash2
} from 'react-icons/fi';

const EventViewerModal = ({ isOpen, onClose, event, isMyEvent = false, onEdit, onDelete }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const images = event?.eventImages || [];

  useEffect(() => {
    if (images.length > 0) {
      setActiveIndex(0); // Reset to first image when opening
    }
  }, [images]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') {
      setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
    if (e.key === 'ArrowRight') {
      setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  }, [onClose, images.length]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 z-50 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] lg:max-h-[90vh] flex flex-col relative transform transition-all scale-100 opacity-100 overflow-hidden">
        {/* Header with Close Button and Action Buttons */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {isMyEvent && (
            <>
              <button
                onClick={onEdit}
                className="p-3 bg-white/90 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                title="Edit Event"
              >
                <FiEdit3 size={20} />
              </button>
              <button
                onClick={onDelete}
                className="p-3 bg-white/90 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Delete Event"
              >
                <FiTrash2 size={20} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-3 bg-white/90 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Image Gallery Section */}
          <div className="w-full h-2/5 lg:h-full lg:w-1/2 lg:absolute lg:left-0 lg:top-0 relative bg-black flex flex-col flex-shrink-0">
            {images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative flex-1">
                  <img
                    src={images[activeIndex]}
                    alt={`Event Image ${activeIndex + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x600/e0f2fe/0369a1?text=Event+Image";
                    }}
                  />

                  {/* Event Title - Mobile Only */}
                  <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h2 className="text-white text-lg font-bold leading-tight">
                      {event.title}
                    </h2>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {activeIndex + 1} / {images.length}
                  </div>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        title="Previous Image"
                      >
                        <FiChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 backdrop-blur-sm hover:scale-110"
                        title="Next Image"
                      >
                        <FiChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {/* Description in Image Section - Only on Desktop */}
                {event.description && (
                  <div className="hidden lg:block bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                      <FiMessageCircle size={16} className="text-primary-600" />
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm max-h-24 overflow-y-auto">
                      {event.description}
                    </p>
                  </div>
                )}

              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <FiImage size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Details Section */}
          <div className="w-full h-3/5 lg:h-full lg:w-1/2 lg:absolute lg:right-0 lg:top-0 overflow-y-auto bg-white flex-1">
            <div className="p-4 lg:p-6 space-y-4 pb-8">
              {/* Event Title - Desktop Only */}
              <div className="hidden lg:block">
                <h2 className="text-lg lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {event.title}
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Event Info Cards */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiCalendar size={16} className="text-primary-600" />
                    <span className="font-semibold text-gray-800 text-sm">Date</span>
                  </div>
                  <p className="text-gray-700 ml-6 text-sm">{event.date}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 border border-green-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiClock size={16} className="text-green-600" />
                    <span className="font-semibold text-gray-800 text-sm">Time</span>
                  </div>
                  <p className="text-gray-700 ml-6 text-sm">{event.time}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiMapPin size={16} className="text-purple-600" />
                    <span className="font-semibold text-gray-800 text-sm">Location</span>
                  </div>
                  <p className="text-gray-700 ml-6 text-sm">{event.location}</p>
                </div>

                {event.attendeesCount && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <FiUsers size={16} className="text-orange-600" />
                      <span className="font-semibold text-gray-800 text-sm">Attendees</span>
                    </div>
                    <p className="text-gray-700 ml-6 text-sm">{event.attendeesCount} people attending</p>
                  </div>
                )}
              </div>

              {/* Description - Mobile Only */}
              {event.description && (
                <div className="lg:hidden bg-gray-50 rounded-xl p-3">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                    <FiMessageCircle size={16} className="text-primary-600" />
                    About This Event
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {event.description}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventViewerModal;
