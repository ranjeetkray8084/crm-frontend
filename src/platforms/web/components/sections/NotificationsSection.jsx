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
  const [filter, setFilter] = useState('all'); // all, unread, read

  // Use the notifications hook
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    clearError
  } = useNotifications(userId, companyId);

  const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

  const handleRefresh = () => {
    refreshNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
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

  // Filter notifications based on search and filter
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.message?.toLowerCase().includes(search);
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);

    return matchesSearch && matchesFilter;
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
              {unreadCount > 0 && (
                <p className="text-sm text-blue-600">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
              >
                Mark All Read
              </button>
            )}
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

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
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
                    <th className="border-b px-6 py-4 text-left font-semibold">Status</th>
                    <th className="border-b px-6 py-4 text-left font-semibold">Message</th>
                    <th className="border-b px-6 py-4 text-left font-semibold">Date</th>
                    <th className="border-b px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                        {search ? 'No notifications match your search.' : 'No notifications found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <tr
                        key={notification.id}
                        className={`text-sm hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {!notification.isRead ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                                Unread
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Read
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          <div className={`${!notification.isRead ? 'font-medium' : ''}`}>
                            {notification.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {formatDate(notification.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Mark as Read
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
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
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border border-gray-200 rounded-lg ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {!notification.isRead ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Read
                          </span>
                        )}
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <div className={`text-sm text-gray-900 mb-2 ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsSection;