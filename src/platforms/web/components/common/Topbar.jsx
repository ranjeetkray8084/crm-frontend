import { Search, Plus, ChevronDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { UserService } from '../../../../core/services';

function Topbar({
  onAddAction = () => {},
  userName = '',
  userRole = '',
  companyName = '',
  onSidebarToggle = () => {},
  onSectionChange = () => {}
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/44x44/6B7280/FFFFFF?text=U');
  const timeoutRef = useRef(null);

  const getAddOptions = () => {
    switch (userRole.toUpperCase()) {
      case 'ADMIN':
        return [
          { id: 'User', label: 'User' },
          { id: 'Lead', label: 'Lead' },
          { id: 'Properties', label: 'Properties' },
          { id: 'Notes', label: 'Notes/Event' },
          { id: 'Task', label: 'Calling Data' },
        ];
      case 'USER':
        return [
          { id: 'Lead', label: 'Lead' },
          { id: 'Properties', label: 'Properties' },
          { id: 'Notes', label: 'Notes/Event' },
        ];
      case 'DIRECTOR':
        return [
          { id: 'User', label: 'User/Admin' },
          { id: 'Lead', label: 'Lead' },
          { id: 'Properties', label: 'Properties' },
          { id: 'Notes', label: 'Notes/Event' },
          { id: 'Task', label: 'Calling Data' },
        ];
      default:
        return [];
    }
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 1000);
  };

  const addOptions = getAddOptions();

  // Fetch user avatar
  const fetchAvatar = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = localUser.userId || localUser.id;
      
      if (userId) {
        const result = await UserService.getAvatar(userId);
        if (result.success && result.data) {
          setAvatarUrl(result.data);
        } else {
          setAvatarUrl(`https://via.placeholder.com/44x44/6B7280/FFFFFF?text=${userName ? userName.charAt(0).toUpperCase() : 'U'}`);
        }
      }
    } catch (error) {
      setAvatarUrl(`https://via.placeholder.com/44x44/6B7280/FFFFFF?text=${userName ? userName.charAt(0).toUpperCase() : 'U'}`);
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, [userName]); // Re-fetch when userName changes

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-5 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left section: Welcome + hamburger */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-2xl font-semibold mb-1">
              Welcome <span className="font-bold">{companyName || 'Company Name'}</span>
            </h1>
            <p className="text-blue-100">Let's take a detailed look at our workplace...</p>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden ml-auto">
            <button
              className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
              onClick={onSidebarToggle}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Right Section: Only on Desktop */}
        <div className="hidden md:flex items-center gap-4 flex-wrap justify-end w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search here"
              className="bg-white text-gray-900 placeholder-gray-500 px-4 py-2 pl-10 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Notification */}
          <NotificationDropdown onSectionChange={onSectionChange} />

          {/* Add Dropdown */}
          {addOptions.length > 0 && (
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full font-medium shadow hover:bg-blue-50 transition">
                <Plus size={18} />
                Add
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-50"
                  >
                    {addOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          onAddAction(option.id);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">{userName || 'User Name'}</div>
              <div className="text-sm text-blue-100">{userRole || 'User'}</div>
            </div>
            <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex items-center justify-center">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(`https://via.placeholder.com/44x44/6B7280/FFFFFF?text=${userName ? userName.charAt(0).toUpperCase() : 'U'}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
