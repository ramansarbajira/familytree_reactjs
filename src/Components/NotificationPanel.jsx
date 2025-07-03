import React, { useEffect, useState } from 'react';
import {
  FiBell,
  FiX,
  FiCheck,
  FiClock,
  FiUser,
  FiCalendar,
  FiGift,
  FiHeart,
} from 'react-icons/fi';
import { getNotificationType, getNotificationActions } from '../utils/notifications';

const NotificationPanel = ({ open, onClose, onNotificationCountUpdate  }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const notificationTypes = {
    request: { icon: <FiUser />, color: 'from-blue-500 to-blue-300' },
    birthday: { icon: <FiGift />, color: 'from-pink-500 to-pink-300' },
    event: { icon: <FiCalendar />, color: 'from-purple-500 to-purple-300' },
    anniversary: { icon: <FiHeart />, color: 'from-red-500 to-red-300' },
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
        type: getNotificationType(n.type),
        title: n.title,
        message: n.message,
        time: new Date(n.createdAt).toLocaleString(),
        read: n.isRead,
        //actions: getNotificationActions(n),
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
      fetchNotifications(false); // Only 5 recent
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end md:pt-16">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <div
        className="relative z-50 w-full md:max-w-sm h-full md:h-[90vh] bg-white md:rounded-l-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-unset text-sm font-medium text-primary-600 hover:underline"
              >
                Mark all
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-unset p-2 rounded-full hover:bg-gray-100 text-black"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-4 border-primary-600 border-solid"></div></div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FiBell size={32} />
              <p className="mt-2">No new notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n) => {
                const typeStyle = notificationTypes[n.type] || {};
                return (
                  <div
                    key={n.id}
                    className={`relative flex items-start p-4 rounded-2xl shadow-sm bg-white border transition-all duration-300 ${
                      !n.read ? 'bg-blue-50 border-blue-300' : 'border-gray-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${typeStyle.color} flex items-center justify-center text-white text-sm shadow-md mr-3`}
                    >
                      {typeStyle.icon || <FiBell />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-xs text-white hover:text-blue-600 border border-gray-300 hover:border-white-500 px-2 py-0.5 rounded-full"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{n.message}</p>

                      <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <FiClock size={12} />
                        <span>{n.time}</span>
                      </div>

                      {n.actions?.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          {n.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={action.onClick}
                              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                                action.primary
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 text-center">
          <div className="px-5 py-3 border-t border-gray-200 text-center">
            <button
              onClick={() => fetchNotifications(true)}
              className="bg-unset text-sm text-primary-600 hover:underline font-medium"
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
