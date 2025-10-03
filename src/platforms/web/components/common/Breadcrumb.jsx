import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ currentSection, onSectionClick }) => {
  const getSectionLabel = (section) => {
    const labels = {
      'ViewDashboard': 'Dashboard',
      'ViewUsers': 'Users',
      'ViewLead': 'Leads',
      'ViewProperty': 'Properties',
      'ViewNotes': 'Notes/Events',
      'ViewTask': 'Calling Data',
      'ViewNotification': 'Notifications',
      'ViewAccount': 'Account',
      'ViewCompany': 'Companies',
      'ViewAdmins': 'Admins',
      'ViewDirectors': 'Directors',
      'addCompany': 'Add Company',
      'User': 'Add User',
      'AddAdmin': 'Add Admin',
      'Lead': 'Add Lead',
      'Properties': 'Add Property',
      'Notes': 'Add Note/Event',
      'Task': 'Add Task'
    };
    return labels[section] || section;
  };

  const getSectionIcon = (section) => {
    const icons = {
      'ViewDashboard': '🏠',
      'ViewUsers': '👥',
      'ViewLead': '📋',
      'ViewProperty': '🏢',
      'ViewNotes': '📝',
      'ViewTask': '📞',
      'ViewNotification': '🔔',
      'ViewAccount': '👤',
      'ViewCompany': '🏢',
      'ViewAdmins': '👑',
      'ViewDirectors': '👨‍💼',
      'addCompany': '➕',
      'User': '➕',
      'AddAdmin': '➕',
      'Lead': '➕',
      'Properties': '➕',
      'Notes': '➕',
      'Task': '➕'
    };
    return icons[section] || '📄';
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button
        onClick={() => onSectionClick('ViewDashboard')}
        className="flex items-center hover:text-blue-600 transition-colors"
      >
        <Home size={16} className="mr-1" />
        Dashboard
      </button>
      
      {currentSection !== 'ViewDashboard' && (
        <>
          <ChevronRight size={16} />
          <span className="flex items-center">
            <span className="mr-2">{getSectionIcon(currentSection)}</span>
            {getSectionLabel(currentSection)}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
