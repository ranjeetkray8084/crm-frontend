import { Bell } from 'lucide-react';
import { useNotifications } from '../../../../core/hooks';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const NotificationDropdown = ({ onSectionChange }) => {
    // Use AuthContext for user data like NotificationsSection does
    const { user } = useAuth();
    const userId = user?.userId || user?.id;
    const companyId = user?.companyId;

    // Use the notifications hook to get unread count and markAllAsRead function
    const { unreadCount, markAllAsRead, loading, error } = useNotifications(userId, companyId);

    const handleNotificationClick = async () => {
        try {
            // Mark all notifications as read when bell icon is clicked
            if (unreadCount > 0) {
                const result = await markAllAsRead();
                if (!result.success) {
              
                }
            }
            
            // Navigate to notifications section
            if (onSectionChange) {
                onSectionChange('ViewNotification');
            }
        } catch (error) {
      
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleNotificationClick}
                className="p-2 hover:bg-blue-600 rounded-full transition-colors relative"
                title={`View Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                disabled={loading}
            >
                <Bell size={20} className="text-yellow-300" />
            {unreadCount > 0 && (
                <span 
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold z-10"
                    style={{ minWidth: '20px', minHeight: '20px' }}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
            </button>
        </div>
    );
};

export default NotificationDropdown;