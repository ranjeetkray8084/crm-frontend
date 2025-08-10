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
        { id: 'ViewDirector', label: 'View Director', icon: Eye },
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
    <aside className={`bg-gray-800 text-white min-h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold">LeadsTracker</h2>
              <p className="text-xs text-gray-400">(By Smartprocare)</p>
            </div>
          )}
         
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`sidebar-button w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-700 transition ${
                    isActive ? 'bg-gray-700 font-semibold' : ''
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
