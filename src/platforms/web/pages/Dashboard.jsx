import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import Breadcrumb from '../components/common/Breadcrumb';
import { useNavigationHistory } from '@/core/hooks';

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
  const [showSidebar, setShowSidebar] = useState(false); // mobile sidebar
  const [isLoading, setIsLoading] = useState(true);
  
  // Use navigation history hook for better navigation management
  const { 
    currentSection: activeSection, 
    navigateToSection: setActiveSection, 
    goBack 
  } = useNavigationHistory('ViewDashboard');

  // Debug logging for navigation
  useEffect(() => {
    console.log('Dashboard: Active section changed to:', activeSection);
  }, [activeSection]);

  useEffect(() => {
    const initializeDashboard = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          const finalUserId = parsedUser.userId || parsedUser.id || '';
          const finalUserRole = parsedUser.role || '';
          const finalCompanyId = parsedUser.companyId || '';
          
          // More lenient check - only redirect if critical data is missing
          if (!finalUserId || !finalUserRole) {
            localStorage.clear();
            window.location.href = '/';
            return;
          }
          
          // Set user data
          setUserRole(finalUserRole);
          setUserName(parsedUser.name || '');
          setUserId(finalUserId);
          setCompanyId(finalCompanyId || ''); // Allow empty companyId for now
          if (parsedUser.companyName) {
            setCompanyName(parsedUser.companyName);
          }
          
          setIsLoading(false);
        } catch (err) {
          localStorage.clear();
          window.location.href = '/';
        }
      } else {
        localStorage.clear();
        window.location.href = '/';
      }
    };

    // Add a small delay to ensure localStorage is fully available
    const timer = setTimeout(initializeDashboard, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  // Handle Quick Add actions with proper navigation history
  const handleAddAction = (action) => {
    console.log('🎯 Dashboard: handleAddAction called with action:', action);
    console.log('🎯 Dashboard: Current section before add action:', activeSection);
    console.log('🎯 Dashboard: About to navigate to:', action);
    
    // Use navigateToSection to properly update navigation history
    setActiveSection(action);
  };

  // Handle sidebar navigation with proper navigation history
  const handleSidebarNavigation = (section) => {
    console.log('🧭 Dashboard: Sidebar navigation to section:', section);
    console.log('🧭 Dashboard: Current section before sidebar navigation:', activeSection);
    console.log('🧭 Dashboard: About to navigate to:', section);
    
    // Use navigateToSection to properly update navigation history
    setActiveSection(section);
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
      case 'addCompany': return <AddCompanyForm onCancel={goBack} />;
      case 'User': return <AddAdmin onCancel={goBack} />;
      case 'AddAdmin': return <AddAdmin onCancel={goBack} />;
      case 'Lead': return <AddLeadForm onCancel={goBack} />;
      case 'Properties': return <AddPropertyForm onCancel={goBack} />;
      case 'Notes': return <AddNoteFormWrapper onCancel={goBack} />;
      case 'Task': return <AddTaskForm onCancel={goBack} />;
      case 'ViewAdmins': return <ViewAdmins />;
      case 'ViewDirectors': return <DirectorSection />;
      case 'logout':
        handleLogout();
        return null;
      default:
        return <div className="text-center text-red-500">🚫 No Access</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar - always visible on desktop */}
      <div className="hidden lg:block">
        <Sidebar
          userRole={userRole}
          activeSection={activeSection}
          onSectionChange={handleSidebarNavigation}
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
            className="fixed inset-0 z-50 bg-black bg-opacity-50 flex lg:hidden"
          >
            <Sidebar
              userRole={userRole}
              activeSection={activeSection}
              onSectionChange={(section) => {
                handleSidebarNavigation(section);
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
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          userName={userName}
          userRole={userRole}
          companyName={companyName}
          onLogout={handleLogout}
          onAddAction={handleAddAction}
          onSectionChange={handleSidebarNavigation}
          onSidebarToggle={() => setShowSidebar(true)} 
        />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3 max-w-7xl">
            <Breadcrumb 
              currentSection={activeSection} 
              onSectionClick={handleSidebarNavigation} 
            />
            <div className="min-h-fit">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
