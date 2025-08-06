import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, MessageCircle, Eye, Trash2 } from 'lucide-react';

const NoteActions = ({ note, onEdit, onDelete, onAddRemark, onViewRemarks }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleAction = (callback) => {
    if (typeof callback === 'function') {
      callback(note.id); // Pass note ID for consistency
    }
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        title="More actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 z-50 bg-white border border-gray-200 rounded-md shadow-xl animate-fadeIn"
          role="menu"
          aria-orientation="vertical"
        >
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                onClick={() => handleAction(onEdit)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Edit Note
              </button>
            </li>
            <li>
              <button
                onClick={() => handleAction(onAddRemark)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
              >
                <MessageCircle size={16} className="mr-2" />
                Add Remark
              </button>
            </li>
            <li>
              <button
                onClick={() => handleAction(onViewRemarks)}
                className="flex w-full items-center px-4 py-2 hover:bg-gray-100"
              >
                <Eye size={16} className="mr-2" />
                View Remarks
              </button>
            </li>
            <li>
              <button
                onClick={() => handleAction(() => onDelete(note.id))}
                className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-100"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Note
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default NoteActions;
