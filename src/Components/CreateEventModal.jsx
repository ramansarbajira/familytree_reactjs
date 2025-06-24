import React, { useState } from 'react';
import { FiX, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';

const CreateEventModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null); // For event banner/image
    const [imagePreview, setImagePreview] = useState('');

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImage(null);
            setImagePreview('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real application, you would handle the event creation here:
        // - Upload image to storage
        // - Save event data to a database
        console.log('New Event:', { title, date, time, location, description, image });
        // Using a custom message box instead of alert() as per instructions
        // For a full app, you'd integrate a proper modal/toast notification system.
        alert('Event created successfully! (Simulated)');
        onClose(); // Close modal after submission
        setTitle('');
        setDate('');
        setTime('');
        setLocation('');
        setDescription('');
        setImage(null);
        setImagePreview('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-inter">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all scale-100 opacity-100 max-h-[90vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="bg-unset absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <FiX size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex-shrink-0">Create New Event</h2>

                {/* Form content with scrollable area */}
                <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto pr-2"> {/* Added flex-grow and overflow-y-auto */}
                    <div>
                        <label htmlFor="event-title" className="block text-gray-700 font-medium mb-2">Event Title</label>
                        <input
                            type="text"
                            id="event-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="e.g., Family BBQ, Cousin's Birthday"
                            required
                        />
                    </div>

                    {/* Two-column layout for date, time, location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="event-date" className="block text-gray-700 font-medium mb-2">Date</label>
                            <input
                                type="date"
                                id="event-date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="event-time" className="block text-gray-700 font-medium mb-2">Time</label>
                            <input
                                type="time"
                                id="event-time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div className="md:col-span-2"> {/* Make location span full width on medium screens */}
                            <label htmlFor="event-location" className="block text-gray-700 font-medium mb-2">Location</label>
                            <input
                                type="text"
                                id="event-location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="e.g., Central Park, Grandparents' House"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="event-description" className="block text-gray-700 font-medium mb-2">Description</label>
                        <textarea
                            id="event-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="Tell more about the event..."
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="event-image-upload" className="block text-gray-700 font-medium mb-2">Event Banner (Optional)</label>
                        <div
                            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors relative"
                            onClick={() => document.getElementById('event-image-input').click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Event Preview" className="max-h-full max-w-full object-contain rounded-xl" />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <FiCalendar size={30} className="mx-auto mb-2 text-primary-400" />
                                    <p>Click to upload event image</p>
                                </div>
                            )}
                            <input
                                id="event-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 pt-4"> {/* Added flex-shrink-0 for the button */}
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
