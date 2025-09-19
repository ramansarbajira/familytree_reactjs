import React, { useEffect, useState } from 'react';
import {
  FiBell,
  FiX,
  FiCheck,
  FiUser,
  FiCalendar,
  FiGift,
  FiHeart,
  FiUsers,
  FiUserPlus,
  FiUserX
} from 'react-icons/fi';
import { getNotificationType } from '../utils/notifications';
import AssociationRequestItem from './FamilyTree/AssociationRequestItem';

const NotificationPanel = ({ open, onClose, onNotificationCountUpdate  }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read'

  const notificationTypes = {
    request: { icon: <FiUser />, color: 'from-blue-500 to-blue-300' },
    birthday: { icon: <FiGift />, color: 'from-pink-500 to-pink-300' },
    event: { icon: <FiCalendar />, color: 'from-purple-500 to-purple-300' },
    anniversary: { icon: <FiHeart />, color: 'from-red-500 to-red-300' },
    family_association_request: { icon: <FiUsers />, color: 'from-green-500 to-green-300' },
    family_association_accepted: { icon: <FiUserPlus />, color: 'from-teal-500 to-teal-300' },
    family_association_rejected: { icon: <FiUserX />, color: 'from-orange-500 to-orange-300' },
  };

  const fetchNotifications = async (getAll = false) => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_BASE_URL}/notifications${getAll ? '?all=true' : ''}`;

      console.log('🔍 Fetching notifications from:', url);
      console.log('🔑 Using token:', localStorage.getItem('access_token') ? 'Token exists' : 'No token');
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      console.log('📡 API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Failed to fetch notifications:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
        return;
      }

      const data = await response.json();
      console.log('📥 Raw notification data from API:', data);
      console.log('📊 Data type:', typeof data, 'Is array:', Array.isArray(data), 'Length:', data?.length);

      const formatted = data.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        time: new Date(n.createdAt).toLocaleString(),
        read: n.isRead,
        status: n.status || 'pending', // Include notification status
        data: n.data || {},
        createdAt: n.createdAt,
        triggeredBy: n.triggeredBy,
      }));

      // Debug: Log all notifications to see what types we're getting
      console.log('All notifications received:', formatted.map(n => ({ id: n.id, type: n.type, title: n.title })));

      setNotifications(formatted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate();
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      // Refetch updated list
      fetchNotifications();
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    if (open) {
      // Fetch all notifications to see if acceptance notifications are there
      fetchNotifications(true);
      
      // Set up automatic refresh every 30 seconds when panel is open
      const refreshInterval = setInterval(() => {
        fetchNotifications();
      }, 30000); // 30 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [open]);

  if (!open) return null;

  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Filter out association requests to handle them separately
  const associationRequests = filteredNotifications.filter(n => n.type === 'family_association_request');
  const otherNotifications = filteredNotifications.filter(n => n.type !== 'family_association_request');

  // Debug: Log the filtering results
  console.log('Filtered notifications:', {
    total: filteredNotifications.length,
    associationRequests: associationRequests.length,
    otherNotifications: otherNotifications.length,
    otherTypes: otherNotifications.map(n => n.type)
  });

  const handleAcceptRequest = async (notification) => {
    try {
      setProcessingRequest(notification.id);
      
      // Extract required data from notification
      const requestData = notification.data || {};
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/family/accept-association`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: notification.id
        })
      });

      if (response.ok) {
        // Remove the processed notification immediately from local state
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // Update notification count immediately (decrements count and fetches actual count)
        if (onNotificationCountUpdate) {
          onNotificationCountUpdate();
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error accepting association:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error accepting association:', error);
      return false;
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (notification) => {
    try {
      setProcessingRequest(notification.id);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/family/reject-association`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: notification.id
        }),
      });

      if (response.ok) {
        // Remove the processed notification immediately from local state
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // Update notification count immediately (decrements count and fetches actual count)
        if (onNotificationCountUpdate) {
          onNotificationCountUpdate();
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error rejecting association:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Error rejecting association:', error);
      return false;
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md transform overflow-hidden bg-white shadow-xl transition-transform duration-300 ease-in-out">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  disabled={notifications.length === 0 || notifications.every(n => n.read)}
                >
                  Mark all as read
                </button>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'read'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <FiBell className="mb-2 h-10 w-10 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900">
                  {activeTab === 'unread' ? 'No unread notifications' : 
                   activeTab === 'read' ? 'No read notifications' : 'No notifications'}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'unread' ? 'All caught up!' : 
                   activeTab === 'read' ? 'No notifications have been read yet.' : 
                   "We'll let you know when there's something new."}
                </p>
              </div>
            ) : (
              <>
                {/* Association Requests Section */}
                {associationRequests.length > 0 && (
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h4 className="text-sm font-medium text-gray-500">Family Association Requests</h4>
                  </div>
                )}
                {associationRequests.map((notification) => {
                  // Get the requester ID and name from notification data
                  const requesterId = notification.data?.requesterId || 
                                   notification.sender?.id || 
                                   notification.data?.sender?.id;
                  
                  const requesterName = notification.data?.senderName || 
                                     notification.data?.requesterName || 
                                     'Someone';
                  
                  const requesterFamilyCode = notification.data?.senderFamilyCode || 
                                           notification.data?.requesterFamilyCode || 
                                           'Their Family';
                  
                  return (
                    <div key={notification.id} className="border-b border-gray-200">
                      <AssociationRequestItem
                        request={{
                          ...notification, // Pass through all notification data
                          id: notification.id,
                          type: notification.type, // Ensure type is passed through
                          message: notification.message, // Ensure message is passed through
                          status: notification.status, // Pass notification status
                          data: {
                            ...notification.data, // Include all data from the notification
                            senderId: requesterId,
                            senderName: requesterName,
                            senderFamilyCode: requesterFamilyCode,
                            // Include target user info if available
                            targetUserId: notification.data?.targetUserId,
                            targetName: notification.data?.targetName,
                            targetFamilyCode: notification.data?.targetFamilyCode || notification.data?.familyCode,
                            requestType: 'family_association'
                          },
                          createdAt: notification.createdAt
                        }}
                        onAccept={() => handleAcceptRequest(notification)}
                        onReject={() => handleRejectRequest(notification)}
                        loading={processingRequest === notification.id}
                      />
                    </div>
                  );
                })}

                {/* Other Notifications */}
                {otherNotifications.length > 0 && (
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                    <h4 className="text-sm font-medium text-gray-500">Other Notifications</h4>
                  </div>
                )}
                <ul className="divide-y divide-gray-200">
                  {otherNotifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`relative px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r ${notificationTypes[notification.type]?.color || 'from-gray-400 to-gray-300'}`}
                        >
                          {notificationTypes[notification.type]?.icon || <FiBell className="h-5 w-5 text-white" />}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title || getNotificationType(notification.type)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          {!notification.read && (
                            <div className="mt-1">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                New
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 p-4 text-center">
            <button
              onClick={() => fetchNotifications(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
