import { Bell } from 'lucide-react';
import { useNotifications } from '../../../../core/hooks';

const NotificationDropdown = ({ onSectionChange }) => {
    // Get user data from localStorage
    const getUserData = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const userId = user?.userId || user?.id;
            const companyId = parseInt(localStorage.getItem("companyId"), 10);
            return { userId, companyId };
        } catch {
            return { userId: null, companyId: null };
        }
    };

    const { userId, companyId } = getUserData();

    // Use the notifications hook to get unread count
    const { unreadCount } = useNotifications(userId, companyId);

    const handleNotificationClick = () => {
        // Navigate to notifications section
        if (onSectionChange) {
            onSectionChange('ViewNotification');
        }
    };

    return (
        <button
            onClick={handleNotificationClick}
            className="p-2 hover:bg-blue-600 rounded-full transition-colors relative"
            title="View Notifications"
        >
            <Bell size={20} className="text-yellow-300" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationDropdown;