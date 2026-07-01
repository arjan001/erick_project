import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/lib/supabaseEntities';
import ArtistSidebar from '@/components/ArtistSidebar';
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
      window.location.href = '/signin';
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
        
        // Sort by created_date descending
        const sorted = allNotifications.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
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
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full flex flex-col overflow-hidden bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="action_required">Action Required</option>
                </select>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Notifications</h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                {filter === 'all' 
                  ? "You're all caught up! Notifications will appear here."
                  : `No ${filter === 'unread' ? 'unread' : 'action required'} notifications.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white border rounded-lg p-4 transition-all ${
                    !notification.read ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(notification.created_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            title="Delete"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {notification.action_required && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleAction(notification)}
                            className="bg-black text-white hover:bg-gray-800"
                          >
                            {notification.type === 'connection_request' ? 'View Request' : 'View'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}