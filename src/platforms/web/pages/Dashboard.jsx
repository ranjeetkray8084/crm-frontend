import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';

import DashboardContent from "../components/sections/DashboardStats";
import Users from "../components/sections/UsersSection";
import Leads from "../components/sections/LeadSection/LeadsSection";
import Properties from "../components/sections/PropertySection/PropertiesSection";
import Notes from "../components/sections/notes/NotesSection ";
import Tasks from "../components/sections/task/TaskSection";
import Account from "../components/sections/AccountSection";
import Notifications from "../components/sections/NotificationsSection";
import ViewAdmins from "../components/sections/AdminSection";
import CompaniesSection from "../components/sections/CompaniesSection";
import DirectorSection from "../components/sections/DirectorSection";

import AddCompanyForm from '../components/forms/AddCompanyFrom';
import AddLeadForm from '../components/forms/AddLeadForm';
import AddNoteFormWrapper from '../components/forms/AddNoteFormWrapper';
import AddPropertyForm from '../components/forms/AddPropertyForm';
import AddTaskForm from '../components/forms/AddTaskFrom';
import AddAdmin from '../components/forms/AddUserFrom';

function Dashboard() {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('SmartProCare');
  const [activeSection, setActiveSection] = useState('ViewDashboard');
  const [showSidebar, setShowSidebar] = useState(false); // mobile sidebar

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🏠 Dashboard user data:', parsedUser);
        
        const finalUserId = parsedUser.userId || parsedUser.id || '';
        const finalUserRole = parsedUser.role || '';
        const finalCompanyId = parsedUser.companyId || '';
        
        console.log('🏠 Dashboard final values:', {
          userId: finalUserId,
          role: finalUserRole,
          companyId: finalCompanyId
        });
        
        setUserRole(finalUserRole);
        setUserName(parsedUser.name || '');
        setUserId(finalUserId);
        setCompanyId(finalCompanyId);
        if (parsedUser.companyName) {
          setCompanyName(parsedUser.companyName);
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'ViewDashboard': return <DashboardContent />;
      case 'ViewUsers': return <Users />;
      case 'ViewLead': return <Leads userRole={userRole} userId={userId} companyId={companyId} />;
      case 'ViewProperty': return <Properties userRole={userRole} userId={userId} companyId={companyId} />;
      case 'ViewNotes': return <Notes />;
      case 'ViewTask': return <Tasks userRole={userRole} userId={userId} companyId={companyId} />;
      case 'ViewNotification': return <Notifications />;
      case 'ViewAccount': return <Account />;
      case 'ViewCompany': return <CompaniesSection />;
      case 'addCompany': return <AddCompanyForm />;
      case 'User': return <AddAdmin />;
      case 'Lead': return <AddLeadForm />;
      case 'Properties': return <AddPropertyForm />;
      case 'Notes': return <AddNoteFormWrapper />;
      case 'Task': return <AddTaskForm />;
      case 'ViewAdmins': return <ViewAdmins />;
      case 'ViewDirector': return <DirectorSection />;
      case 'logout':
        handleLogout();
        return null;
      default:
        return <div className="text-center text-red-500">🚫 No Access</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 overflow-hidden">
      {/* Sidebar - always visible on desktop */}
      <div className="hidden md:block">
        <Sidebar
          userRole={userRole}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          companyName={companyName}
          userName={userName}
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex"
          >
            <Sidebar
              userRole={userRole}
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section);
                setShowSidebar(false); // close after selection
              }}
              companyName={companyName}
              userName={userName}
            />
            <div
              className="flex-1"
              onClick={() => setShowSidebar(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar
          userName={userName}
          userRole={userRole}
          companyName={companyName}
          onLogout={handleLogout}
          onAddAction={(action) => setActiveSection(action)}
          onSectionChange={setActiveSection}
          onSidebarToggle={() => setShowSidebar(true)} // Pass trigger to Topbar
        />
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
