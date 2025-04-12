import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getNotifications, markNotificationRead, archiveNotification } from '../api/notifications';
import { Notification, NotificationSeverity } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'normal' | 'caution' | 'risk'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await archiveNotification(id);
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_archived: true } : notification
      ));
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return !notification.is_archived;
    return notification.severity === filter && !notification.is_archived;
  });

  const getSeverityClass = (severity: NotificationSeverity) => {
    switch (severity) {
      case NotificationSeverity.NORMAL:
        return 'notification-normal';
      case NotificationSeverity.CAUTION:
        return 'notification-caution';
      case NotificationSeverity.RISK:
        return 'notification-risk';
      default:
        return 'notification-normal';
    }
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-dark-100 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-dark-300 flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold">Notifications</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-dark-300 flex space-x-2">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'normal' ? 'bg-status-normal bg-opacity-20 text-status-normal' : 'bg-dark-200'}`}
            onClick={() => setFilter('normal')}
          >
            Normal
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'caution' ? 'bg-status-caution bg-opacity-20 text-status-caution' : 'bg-dark-200'}`}
            onClick={() => setFilter('caution')}
          >
            Caution
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'risk' ? 'bg-status-risk bg-opacity-20 text-status-risk' : 'bg-dark-200'}`}
            onClick={() => setFilter('risk')}
          >
            Risk
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-light-300">
              No notifications to display
            </div>
          ) : (
            <ul className="divide-y divide-dark-300">
              {filteredNotifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 ${getSeverityClass(notification.severity)} ${notification.is_read ? 'opacity-70' : ''}`}
                >
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <span className="text-xs text-light-300">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {notification.related_type && (
                    <p className="text-xs text-light-300 mt-1">
                      {notification.related_type}: {notification.related_id}
                    </p>
                  )}
                  
                  <div className="mt-2 flex justify-end space-x-2">
                    {!notification.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-accent hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleArchive(notification.id)}
                      className="text-xs text-light-300 hover:underline"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
