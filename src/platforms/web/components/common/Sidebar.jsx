import { useState } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Building,
  Calendar,
  Phone,
  Bell,
  User,
  LogOut,
  Menu,
  Plus,
  Eye,
  Clock,
} from 'lucide-react';
import logoImg from '../../../../assets/img/logo.png';

function Sidebar({ userRole, activeSection, onSectionChange, companyName, userName, userRoleDisplay }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getMenuItems = () => {
    const commonItems = [{ id: 'ViewDashboard', label: 'Dashboard', icon: BarChart3 }];

    const roleSpecificItems = {
      ADMIN: [
        { id: 'ViewUsers', label: 'Users', icon: Users },
        { id: 'ViewLead', label: 'Leads', icon: FileText },
        { id: 'ViewProperty', label: 'Property', icon: Building },
        { id: 'ViewNotes', label: 'Notes/Event', icon: Calendar },
        { id: 'ViewTask', label: 'Calling Data', icon: Phone },
        { id: 'ViewAccount', label: 'Account', icon: User },
        { id: 'logout', label: 'Log Out', icon: LogOut },
      ],
      USER: [
        { id: 'ViewLead', label: 'Leads', icon: FileText },
        { id: 'ViewProperty', label: 'Property', icon: Building },
        { id: 'ViewNotes', label: 'Notes/Event', icon: Calendar },
        { id: 'ViewTask', label: 'Calling Data', icon: Phone },
        { id: 'ViewAccount', label: 'Account', icon: User },
        { id: 'logout', label: 'Log Out', icon: LogOut },
      ],
      DEVELOPER: [
        { id: 'addCompany', label: 'Add Company', icon: Plus },
        { id: 'ViewCompany', label: 'View Company', icon: Eye },
        { id: 'AddAdmin', label: 'Add Admin / Users', icon: Plus },
        { id: 'ViewAdmins', label: 'View Admin', icon: Eye },
        { id: 'ViewDirectors', label: 'View Directors', icon: Eye },
        { id: 'ViewUsers', label: 'View Users', icon: Eye },
        { id: 'ViewAccount', label: 'Account', icon: User },
        { id: 'logout', label: 'Log Out', icon: LogOut },
      ],
      DIRECTOR: [
        { id: 'ViewAdmins', label: 'Admins', icon: Users },
        { id: 'ViewUsers', label: 'Users', icon: Users },
        { id: 'ViewLead', label: 'Leads', icon: FileText },
        { id: 'ViewProperty', label: 'Property', icon: Building },
        { id: 'ViewNotes', label: 'Notes/Event', icon: Calendar },
        { id: 'ViewTask', label: 'Calling Data', icon: Phone },
        { id: 'ViewAccount', label: 'Account', icon: User },
        { id: 'logout', label: 'Log Out', icon: LogOut },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[userRole] || [])];
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`bg-gray-800 text-white min-h-screen transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} lg:w-64`}>
      {/* Header */}
      <div className="p-3 lg:p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Logo"
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-base lg:text-lg font-semibold truncate">LeadsTracker</h2>
              <p className="text-xs text-gray-400 truncate">(By Smartprocare)</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`sidebar-button w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm lg:text-base ${
                    isActive ? 'bg-gray-700 font-semibold text-white' : 'text-gray-300 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={18} className="lg:w-5 lg:h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - User Info (Mobile Only) */}
      <div className="lg:hidden p-3 border-t border-gray-700 flex-shrink-0">
        <div className="text-center">
          <div className="text-sm font-medium text-white truncate">{userName || 'User'}</div>
          <div className="text-xs text-gray-400">{userRole || 'Role'}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
