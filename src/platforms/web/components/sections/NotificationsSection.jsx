import { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../../../core/hooks/useNotifications';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const NotificationsSection = () => {
  const { user } = useAuth();
  const userId = user?.userId || user?.id;
  const companyId = user?.companyId;

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, follow-up, general

  // Use the notifications hook
  const {
    notifications,
    loading,
    error,
    refreshNotifications,
    clearError
  } = useNotifications(userId, companyId);

  const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

  const handleRefresh = () => {
    refreshNotifications();
  };



  // Helper function to check if notification is follow-up related
  const isFollowUpNotification = (message) => {
    return message && (
      message.includes('📅') || 
      message.includes('⏰') || 
      message.includes('Follow-up') || 
      message.includes('follow-up') ||
      message.includes('scheduled for')
    );
  };

  // Helper function to get notification type
  const getNotificationType = (message) => {
    if (isFollowUpNotification(message)) {
      return 'follow-up';
    }
    return 'general';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter notifications based on search and type
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.message?.toLowerCase().includes(search);
    
    const notificationType = getNotificationType(notification.message);
    const matchesTypeFilter =
      typeFilter === 'all' ||
      (typeFilter === 'follow-up' && notificationType === 'follow-up') ||
      (typeFilter === 'general' && notificationType === 'general');

    return matchesSearch && matchesTypeFilter;
  });

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="text-gray-500" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh notifications"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="follow-up">📅 Follow-ups</option>
            <option value="general">🔔 General</option>
          </select>
        </div>
      </div>

      {/* Notification Summary */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Total:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Follow-ups:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              {notifications.filter(n => getNotificationType(n.message) === 'follow-up').length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">General:</span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
              {notifications.filter(n => getNotificationType(n.message) === 'general').length}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full table-auto border-collapse bg-white">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="border-b px-6 py-4 text-left font-semibold">Type</th>
                    <th className="border-b px-6 py-4 text-left font-semibold">Message</th>
                    <th className="border-b px-6 py-4 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-gray-500">
                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                        {search ? 'No notifications match your search.' : 'No notifications found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const notificationType = getNotificationType(notification.message);
                      return (
                        <tr
                          key={notification.id}
                          className={`text-sm hover:bg-gray-50 transition-colors ${notificationType === 'follow-up' ? 'border-l-4 border-l-green-500' : ''}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {notificationType === 'follow-up' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  📅 Follow-up
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  🔔 General
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            <div>
                              {notification.message}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">
                            {formatDate(notification.createdAt)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                  {search ? 'No notifications match your search.' : 'No notifications found.'}
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const notificationType = getNotificationType(notification.message);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border border-gray-200 rounded-lg bg-white ${notificationType === 'follow-up' ? 'border-l-4 border-l-green-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {notificationType === 'follow-up' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📅 Follow-up
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🔔 General
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 mb-2">
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsSection;