import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, archiveNotification } from '../api/notifications';
import { Notification, NotificationSeverity } from '../types';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'normal' | 'caution' | 'risk'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

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
    // Filter by severity
    if (filter !== 'all' && notification.severity !== filter) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && notification.related_type !== typeFilter) return false;
    
    // Filter by search term
    if (searchTerm && !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // Don't show archived notifications
    return !notification.is_archived;
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

  const getRelatedTypes = () => {
    const types = new Set<string>();
    notifications.forEach(notification => {
      if (notification.related_type) {
        types.add(notification.related_type);
      }
    });
    return Array.from(types);
  };

  const relatedTypes = getRelatedTypes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Notification Center</h1>
        <p className="text-light-300 mt-1">View and manage system notifications</p>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
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
          
          <div className="flex gap-2">
            <select 
              className="select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {relatedTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <input
              type="text"
              className="input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <button 
              className="btn btn-primary"
              onClick={fetchNotifications}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No notifications found</h3>
          <p className="text-light-300">Try changing your filters or check back later</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`card ${getSeverityClass(notification.severity)} ${notification.is_read ? 'opacity-70' : ''}`}
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{notification.message}</h3>
                <span className="text-xs text-light-300">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              
              {notification.related_type && (
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-light-300 mr-1">Related to:</span>
                  <span className="badge badge-normal">
                    {notification.related_type} {notification.related_id}
                  </span>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-3">
                {!notification.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-sm text-accent hover:underline"
                  >
                    Mark as read
                  </button>
                )}
                <button 
                  onClick={() => handleArchive(notification.id)}
                  className="text-sm text-light-300 hover:underline"
                >
                  Archive
                </button>
                <button className="text-sm text-light-300 hover:underline">
                  Assign
                </button>
                <button className="text-sm text-light-300 hover:underline">
                  Pin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
