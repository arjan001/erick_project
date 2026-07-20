import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Bell, Check, X, Briefcase, MessageCircle, Users, Award, ThumbsUp, Clock, Filter, CreditCard, UserCheck, MessageSquare, Heart, Star, Ticket, Zap, CheckCheck } from 'lucide-react';
import realtimeMessagingService from '@/services/realtimeMessagingService';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { user: authUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, action_required

  const fetchNotifications = async () => {
    if (!authUser?.email) return;
    try {
      const allNotifications = await Notification.filter({ 
        recipient_email: authUser.email 
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

  useEffect(() => {
    fetchNotifications();
  }, [authUser]);

  // Real-time notification subscription
  useEffect(() => {
    if (!authUser?.email) return;

    const handleNewNotification = (newNotification) => {
      console.log('Real-time new notification received:', newNotification);
      setNotifications(prev => [newNotification, ...prev]);
    };

    const unsubscribe = realtimeMessagingService.subscribeToNotifications(
      authUser.email,
      handleNewNotification
    );

    return () => unsubscribe();
  }, [authUser]);

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

  const handleDeleteAllRead = async () => {
    try {
      const read = notifications.filter(n => n.read);
      await Promise.all(
        read.map(n => Notification.delete(n.id))
      );
      setNotifications(prev => prev.filter(n => !n.read));
      success('Success', 'All read notifications deleted');
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      error('Failed', 'Failed to delete read notifications');
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
    const iconMap = {
      'message': <MessageSquare className="w-5 h-5 text-white" />,
      'connection_request': <UserCheck className="w-5 h-5 text-white" />,
      'job_application': <Briefcase className="w-5 h-5 text-white" />,
      'job_status': <Briefcase className="w-5 h-5 text-white" />,
      'job_invitation': <Briefcase className="w-5 h-5 text-white" />,
      'subscription': <Star className="w-5 h-5 text-white" />,
      'payment': <CreditCard className="w-5 h-5 text-white" />,
      'connects': <Zap className="w-5 h-5 text-white" />,
      'ticket_response': <Ticket className="w-5 h-5 text-white" />,
      'endorsement': <Heart className="w-5 h-5 text-white" />,
      'testimonial': <Star className="w-5 h-5 text-white" />,
      'project_update': <Briefcase className="w-5 h-5 text-white" />,
      'system': <Bell className="w-5 h-5 text-white" />,
    };
    return iconMap[type] || <Bell className="w-5 h-5 text-white" />;
  };

  const getNotificationIconColor = (type) => {
    const colorMap = {
      'message': 'bg-blue-500',
      'connection_request': 'bg-green-500',
      'job_application': 'bg-purple-500',
      'job_status': 'bg-orange-500',
      'job_invitation': 'bg-purple-500',
      'subscription': 'bg-yellow-500',
      'payment': 'bg-emerald-500',
      'connects': 'bg-cyan-500',
      'ticket_response': 'bg-indigo-500',
      'endorsement': 'bg-pink-500',
      'testimonial': 'bg-rose-500',
      'project_update': 'bg-teal-500',
      'system': 'bg-gray-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  if (!authUser || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

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
          </select>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="flex items-center gap-1">
              <CheckCheck className="w-3 h-3" />
              Mark All Read
            </Button>
          )}
          {readCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleDeleteAllRead} className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300">
              <X className="w-3 h-3" />
              Clear Read
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationIconColor(notification.type)}`}>
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
                    {formatNotificationTime(notification.created_at)}
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