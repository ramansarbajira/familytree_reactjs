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
  const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'

  const notificationTypes = {
    request: { icon: <FiUser />, color: 'from-blue-500 to-blue-300' },
    birthday: { icon: <FiGift />, color: 'from-pink-500 to-pink-300' },
    event: { icon: <FiCalendar />, color: 'from-purple-500 to-purple-300' },
    anniversary: { icon: <FiHeart />, color: 'from-red-500 to-red-300' },
    family_association_request: { icon: <FiUsers />, color: 'from-green-500 to-green-300' },
    family_association_accepted: { icon: <FiUserPlus />, color: 'from-teal-500 to-teal-300' },
    family_association_rejected: { icon: <FiUserX />, color: 'from-orange-500 to-orange-300' },
    family_member_removed: { icon: <FiUserX />, color: 'from-red-500 to-red-300' },
    family_member_joined: { icon: <FiUserPlus />, color: 'from-green-500 to-green-300' },
  };

  const fetchNotifications = async (getAll = false) => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_BASE_URL}/notifications${getAll ? '?all=true' : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await response.json();

      const formatted = data.map((n) => ({
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        time: n.createdAt, // Keep the original ISO string for proper parsing
        read: n.isRead,
        data: n.data || {},
        createdAt: n.createdAt,
        triggeredBy: n.triggeredBy,
      }));

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
      fetchNotifications();
      
      // Set up automatic refresh every 30 seconds when panel is open
      const refreshInterval = setInterval(() => {
        fetchNotifications();
      }, 30000); // 30 seconds
      
      return () => clearInterval(refreshInterval);
    }
  }, [open]);

  if (!open) return null;

  // Apply filter to notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'read') return notification.read;
    if (filter === 'unread') return !notification.read;
    return true; // 'all'
  });

  // Filter out association requests to handle them separately
  const associationRequests = filteredNotifications.filter(n => n.type === 'family_association_request');
  const otherNotifications = filteredNotifications.filter(n => n.type !== 'family_association_request');

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
        // Remove the processed notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        if (onNotificationCountUpdate) onNotificationCountUpdate();
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
        // Remove the processed notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
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
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  filter === 'all' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  filter === 'unread' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  filter === 'read' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
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
                <h4 className="text-lg font-medium text-gray-900">No notifications</h4>
                <p className="mt-1 text-sm text-gray-500">We'll let you know when there's something new.</p>
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
                              {new Date(notification.time).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
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
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#2563eb',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#1d4ed8';
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#2563eb';
                e.target.style.textDecoration = 'none';
              }}
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
