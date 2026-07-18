import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Briefcase, MessageCircle, Users, Award, ThumbsUp, Clock, Filter } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, action_required

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const allNotifications = await Notification.filter({ 
          recipient_email: user.email 
        });
        
        // Sort by created_at descending
        const sorted = allNotifications.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setNotifications(sorted);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { read: true });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      error('Failed', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(
        unread.map(n => Notification.update(n.id, { read: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      success('Success', 'All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      error('Failed', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      success('Deleted', 'Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      error('Failed', 'Failed to delete notification');
    }
  };

  const handleAction = async (notification) => {
    await handleMarkAsRead(notification.id);
    
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.action_data?.job_id) {
      navigate(`/jobs/${notification.action_data.job_id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_invitation':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'connection_request':
        return <Users className="w-5 h-5 text-green-600" />;
      case 'endorment':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'testimonial':
        return <ThumbsUp className="w-5 h-5 text-purple-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'action_required') return n.action_required;
    return true;
  });

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="action_required">Action Required</option>
          </select>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  {filter === 'all' 
                    ? "No notifications yet"
                    : `No ${filter === 'unread' ? 'unread' : 'action required'} notifications.`
                  }
                </td>
              </tr>
            ) : (
              filteredNotifications.map((notification) => (
                <tr
                  key={notification.id}
                  className={`hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/20' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0">
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {notification.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{notification.message}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {!notification.read ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Unread
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Read
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {notification.action_required && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(notification)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          View
                        </Button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}