import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';

const CreateEventModal = ({
  isOpen,
  onClose,
  apiBaseUrl = 'https://familytree-backend-trs6.onrender.com',
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [userId, setUserId] = useState(null);
  const [familyCode, setFamilyCode] = useState(null);

  // Fetch userId and familyCode when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        // console.log('🔑 Token:', token);

        if (!token) {
          alert('No access token found.');
          return;
        }

        const decoded = jwtDecode(token);
        // console.log('🧩 Decoded Token:', decoded);

        const uid = decoded.id || decoded.userId;
        if (!uid) {
          alert('User ID not found in token.');
          return;
        }
        setUserId(uid);

        const res = await fetch(`${apiBaseUrl}/user/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error('❌ User API failed:', await res.text());
          return;
        }

        const userData = await res.json();
        // console.log('📦 User API data:', userData);

        const fc =
          userData?.data?.userProfile?.familyMember?.familyCode ||
          userData?.data?.userProfile?.familyCode;

        if (fc) {
          setFamilyCode(fc);
          console.log('✅ Family Code set:', fc);
        } else {
          console.warn('❌ No familyCode found in API response');
        }
      } catch (err) {
        console.error('💥 Fetch user error:', err);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !familyCode) {
      alert('User ID or Family Code missing.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('eventTitle', title);
      formData.append('eventDescription', description);
      formData.append('eventDate', date);
      formData.append('eventTime', time);
      formData.append('location', location);
      formData.append('familyCode', familyCode);

      images.forEach((img) => {
        formData.append('eventImages', img);
      });

      const response = await fetch(`${apiBaseUrl}/event/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('API error:', errText);
        return;
      }

      const resData = await response.json();
    //   console.log('Event Created:', resData);

      // Reset form
      setTitle('');
      setDate('');
      setTime('');
      setLocation('');
      setDescription('');
      setImages([]);
      setImagePreviews([]);
      onClose();
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto pr-2 flex-grow"
        >
          <div>
            <label className="block mb-2">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., Wedding"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block mb-2">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Chennai"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Tell us about the event..."
            ></textarea>
          </div>

          <div>
            <label className="block mb-2">Event Banners (You can select multiple)</label>
            <div
              className="w-full min-h-32 border-2 border-dashed flex items-center justify-center cursor-pointer relative p-2"
              onClick={() => document.getElementById('event-image-input').click()}
            >
              {imagePreviews.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto max-w-full">
                  {imagePreviews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Preview ${idx}`}
                      className="h-28 object-contain rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center">
                  <FiCalendar size={30} className="mx-auto mb-2" />
                  Click to upload images
                </div>
              )}
              <input
                id="event-image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
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
