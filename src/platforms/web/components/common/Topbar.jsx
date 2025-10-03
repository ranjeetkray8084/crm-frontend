import { Plus, ChevronDown, Menu, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { UserService } from '../../../../core/services';
import { createFallbackAvatar } from '../../../../core/utils/avatarUtils';

function Topbar({
  onAddAction = () => {},
  userName = '',
  userRole = '',
  companyName = '',
  onSidebarToggle = () => {},
  onSectionChange = () => {},
  currentSection = 'ViewDashboard'
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const timeoutRef = useRef(null);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const phoneDropdownRef = useRef(null);

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

  // Get section title based on current section
  const getSectionTitle = () => {
    switch (currentSection) {
      case 'ViewDashboard': return 'Dashboard';
      case 'ViewUsers': return 'User Management';
      case 'ViewLead': return 'Lead Management';
      case 'ViewProperty': return 'Property Management';
      case 'ViewNotes': return 'Notes Management';
      case 'ViewTask': return 'Task Management';
      case 'ViewNotification': return 'Notifications';
      case 'ViewAccount': return 'Account Settings';
      case 'ViewCompany': return 'Company Management';
      case 'ViewAdmins': return 'Admin Management';
      case 'ViewDirectors': return 'Director Management';
      default: return 'Dashboard';
    }
  };

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
          setAvatarUrl(null); // Will use fallback
        }
      }
    } catch (error) {
      setAvatarUrl(null); // Will use fallback
    }
  };

  useEffect(() => {
    fetchAvatar();
  }, [userName]); // Re-fetch when userName changes

  // Click outside handler for phone dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setShowPhoneDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg sticky top-0 z-40">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left section: Welcome + hamburger */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 truncate">
                Welcome <span className="font-bold">{companyName || 'Company Name'}</span>
              </h1>
              <p className="text-blue-100 text-sm md:text-base hidden sm:block">Let's take a detailed look at our workplace...</p>
            </div>

            {/* Mobile Hamburger */}
            <div className="lg:hidden ml-4 flex-shrink-0">
              <button
                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                onClick={onSidebarToggle}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          {/* Center Section: Current Component Title */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <motion.div 
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm"
              key={currentSection}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {getSectionTitle()}
            </motion.div>
          </div>

          {/* Right Section: Desktop and Tablet */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 flex-wrap justify-end w-full lg:w-auto">
          {/* Notification */}
          <NotificationDropdown onSectionChange={onSectionChange} />

          {/* Add Dropdown */}
          {addOptions.length > 0 && (
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className="flex items-center gap-2 bg-white text-blue-600 px-3 md:px-4 py-2 rounded-full font-medium shadow hover:bg-blue-50 transition-colors duration-200 text-sm md:text-base">
                <Plus size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">Add</span>
                <ChevronDown size={14} className="md:w-4 md:h-4" />
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

          {/* Profile Picture */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium text-sm md:text-base truncate max-w-32">{userName || 'User Name'}</div>
              <div className="text-xs md:text-sm text-blue-100">{userRole || 'User'}</div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer">
              <img
                src={avatarUrl || createFallbackAvatar(userName, 48)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(createFallbackAvatar(userName, 48))}
              />
            </div>
          </div>
        </div>
        </div>

        {/* Mobile Bottom Section */}
        <div className="md:hidden mt-4 flex items-center justify-between gap-3">
          {/* Mobile Notification Icon */}
          <div className="flex-shrink-0">
            <NotificationDropdown onSectionChange={onSectionChange} />
          </div>

          {/* Mobile User Info */}
          <div className="flex items-center gap-2 bg-blue-600 px-3 py-2 rounded-lg">
            <div className="text-right">
              <div className="font-medium text-xs truncate max-w-20">{userName || 'User'}</div>
              <div className="text-xs text-blue-200">{userRole || 'Role'}</div>
            </div>
            {/* Mobile Profile Picture - Right Side */}
            <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
              <img
                src={avatarUrl || createFallbackAvatar(userName, 32)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(createFallbackAvatar(userName, 32))}
              />
            </div>
          </div>
        </div>

        {/* Mobile Plus Button - Bottom Right */}
        {addOptions.length > 0 && (
          <div className="md:hidden fixed bottom-6 right-6 z-50" ref={phoneDropdownRef}>
            <button 
              className="mobile-plus-btn flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 relative overflow-hidden"
              onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
              aria-label="Quick Add Menu"
            >
              <div className="plus-icon-container transition-transform duration-300">
                <Plus size={24} className="transition-all duration-300" />
              </div>
              <div className="ripple-effect absolute inset-0 rounded-full bg-white opacity-0 scale-0 transition-all duration-300"></div>
            </button>

            <AnimatePresence>
              {showPhoneDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-3 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-48 z-50"
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">Quick Add</h3>
                  </div>
                  {addOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        onAddAction(option.id);
                        setShowPhoneDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;
