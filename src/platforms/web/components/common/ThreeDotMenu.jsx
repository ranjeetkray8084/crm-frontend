import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

const ThreeDotMenu = ({
  item,
  actions = [],
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom-right');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate best position for dropdown
  const calculatePosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const dropdownWidth = 180; // min-w-[180px]
      const dropdownHeight = actions.length * 48 + 16; // Approximate height based on actions
      
      // Check space on all sides
      const spaceRight = windowWidth - buttonRect.right;
      const spaceLeft = buttonRect.left;
      const spaceBottom = windowHeight - buttonRect.bottom;
      const spaceTop = buttonRect.top;
      
      // Determine horizontal position (left/right)
      let horizontalPos = 'right';
      if (spaceRight < dropdownWidth && spaceLeft >= dropdownWidth) {
        horizontalPos = 'left';
      }
      
      // Determine vertical position (top/bottom)
      let verticalPos = 'bottom';
      if (spaceBottom < dropdownHeight && spaceTop >= dropdownHeight) {
        verticalPos = 'top';
      }
      
      // Combine positions: top-right, top-left, bottom-right, bottom-left
      setDropdownPosition(`${verticalPos}-${horizontalPos}`);
    }
  };

  const handleAction = (callback) => {
    if (typeof callback === 'function') {
      callback(item);
    }
    setOpen(false);
  };

  const handleToggle = () => {
    if (!open) {
      calculatePosition();
    }
    setOpen(!open);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
          open ? 'bg-gray-100 text-gray-700 shadow-sm' : ''
        }`}
        title="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          className={`fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[180px] ${
            // Vertical positioning
            dropdownPosition.startsWith('top') ? 'bottom-auto top-auto' : 'top-auto bottom-auto'
          } ${
            // Horizontal positioning
            dropdownPosition.endsWith('left') ? 'right-auto left-auto' : 'right-auto left-auto'
          }`}
          role="menu"
          aria-orientation="vertical"
          style={{
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            top: buttonRef.current ? (dropdownPosition.startsWith('top') ? buttonRef.current.getBoundingClientRect().top - 8 : buttonRef.current.getBoundingClientRect().bottom + 8) : 'auto',
            left: buttonRef.current ? (dropdownPosition.endsWith('left') ? buttonRef.current.getBoundingClientRect().right - 180 : buttonRef.current.getBoundingClientRect().left) : 'auto',
            transform: dropdownPosition.startsWith('top') ? 'translateY(-100%)' : 'none'
          }}
        >
          <div className="py-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action.onClick)}
                className={`flex w-full items-center px-4 py-3 text-sm text-left hover:bg-gray-50 transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                  action.danger 
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {action.icon && (
                  <span className={`mr-3 flex-shrink-0 ${action.danger ? 'text-red-500' : 'text-gray-500'}`}>
                    {action.icon}
                  </span>
                )}
                <span className="truncate font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDotMenu;