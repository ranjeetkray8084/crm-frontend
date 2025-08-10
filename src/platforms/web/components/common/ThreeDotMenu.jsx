
import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

const ThreeDotMenu = ({
  item,
  actions = [],
  position = 'right-0',
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Calculate dropdown position based on button location
  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const dropdownHeight = 250; // Approximate dropdown height including padding

      // Calculate available space below and above the button
      const spaceBelow = windowHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If there's not enough space below but enough space above, show dropdown above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  // Close dropdown on outside click and handle window resize
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleResize = () => {
      if (open) {
        calculateDropdownPosition();
      }
    };

    const handleScroll = () => {
      if (open) {
        calculateDropdownPosition();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const handleAction = (callback) => {
    if (typeof callback === 'function') {
      callback(item);
    }
    setOpen(false);
  };



  const handleToggle = () => {
    if (!open) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        calculateDropdownPosition();
      }, 10);
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef} style={{ zIndex: open ? 9999 : 'auto' }}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          className={`absolute ${position} ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            } w-52 z-[9999] bg-white border border-gray-200 rounded-md shadow-2xl`}
          role="menu"
          aria-orientation="vertical"
          style={{
            boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <ul className="py-1 text-sm text-gray-700">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <li key={index}>
                <button
                  onClick={() => handleAction(action.onClick)}
                  className={`flex w-full items-center px-4 py-2 hover:bg-gray-100 ${action.danger ? 'text-red-600 hover:bg-red-50' : ''
                    }`}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;
