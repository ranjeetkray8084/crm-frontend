import { BarChart3, Building, TrendingUp, Calendar, Users, Phone, Home, ShoppingCart, Key, CheckCircle, XCircle, UserCheck, Shield, Clock } from 'lucide-react';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useDashboardStats, useTodayEvents } from '../../../../core/hooks/useDashboardStats';
import { useTodayFollowUps } from '../../../../core/hooks/useTodayFollowUps';

const DashboardStats = () => {
  try {
    const { user } = useAuth();
    const companyId = user?.companyId;
    const userId = user?.userId || user?.id;
    const role = user?.role;

    // Check if we have valid user data before making API calls
    if (!user || !userId || !role) {
      return (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
            <p className="text-yellow-700">Please log in to view dashboard statistics.</p>
          </div>
        </div>
      );
    }

    // Show warning if companyId is missing but don't block the UI
    if (!companyId) {
    }

    // Use custom hooks for dashboard data
    const {
      stats,
      loading: statsLoading,
      error: statsError
    } = useDashboardStats(companyId, userId, role);

    const {
      todayEvents,
      loading: eventsLoading,
      error: eventsError
    } = useTodayEvents(companyId, userId);

    const {
      todayFollowUps,
      loading: followUpsLoading,
      error: followUpsError
    } = useTodayFollowUps(companyId);

    const loading = statsLoading || eventsLoading || followUpsLoading;

    // Show error message if there are critical errors
    if (statsError && !loading) {
    }

    if (eventsError && !loading) {
    }

    if (followUpsError && !loading) {
    }

    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="bg-gray-200 animate-pulse h-64 rounded-xl"></div>
        </div>
      );
    }

    // Get userId from localStorage for robust matching
    let localUserId = null;
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        localUserId = parsedUser.userId || parsedUser.id;
      }
    } catch {}

    const filteredFollowUps = (todayFollowUps || []).filter(fu => fu.userId === localUserId);

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        {role === 'USER' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LeadsCard
              totalLeads={stats?.totalLeads}
              newLeads={stats?.newLeads}
              contactedLeads={stats?.contactedLeads}
            />
            <PropertyOverviewCard propertyOverview={stats?.propertyOverview} />
            <DealsClosedCard dealsOverview={stats?.dealsOverview} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LeadsCard
              totalLeads={stats?.totalLeads}
              newLeads={stats?.newLeads}
              contactedLeads={stats?.contactedLeads}
            />
            <PropertyOverviewCard propertyOverview={stats?.propertyOverview} />
            <DealsClosedCard dealsOverview={stats?.dealsOverview} />
            <UsersAdminsOverviewCard usersOverview={stats?.usersOverview} />
          </div>
        )}


        {/* Today's Events and Follow-ups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calendar className="text-blue-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Your Events for Today</h3>
            </div>

            {!todayEvents || todayEvents.length === 0 ? (
              <EmptyEventMessage />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Content</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Scheduled Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(todayEvents || []).map((event) => (
                      <tr key={event?.id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">{event?.content || 'No content'}</td>
                        <td className="py-3 px-4">
                          {event?.dateTime ? new Date(event.dateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Kolkata',
                          }) : 'No time'}
                        </td>
                        <td className="py-3 px-4">{event?.username || 'Unknown'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Follow-ups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Clock className="text-green-600 mr-3" size={24} />
              <h3 className="text-xl font-semibold text-gray-900">Today's Follow-ups</h3>
            </div>

            {!todayFollowUps || todayFollowUps.length === 0 ? (
              <EmptyFollowUpMessage />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Lead</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Note</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFollowUps.map((followUp) => (
                      <tr key={followUp?.id || Math.random()} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {followUp?.lead?.name || 'Unknown Lead'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {followUp?.lead?.phone || 'No phone'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate">
                            {followUp?.note || 'No note'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {followUp?.followupDate ? new Date(followUp.followupDate).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Kolkata',
                          }) : 'No time'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-700">Something went wrong while loading dashboard statistics. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
};

const LeadsCard = ({ totalLeads, newLeads, contactedLeads }) => {
  // Add null checks and default values
  const safeTotalLeads = totalLeads || 0;
  const safeNewLeads = newLeads || 0;
  const safeContactedLeads = contactedLeads || 0;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-100">Leads Overview</h3>
        <BarChart3 size={32} className="text-blue-200" />
      </div>

      <div className="space-y-3">
        {/* Total Leads */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-200" />
            <span className="text-sm font-medium text-blue-100">Total</span>
          </div>
          <span className="text-2xl font-bold">{safeTotalLeads}</span>
        </div>

        {/* New Leads */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-200" />
            <span className="text-sm font-medium text-blue-100">New</span>
          </div>
          <span className="text-xl font-semibold">{safeNewLeads}</span>
        </div>

        {/* Contacted Leads */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-blue-200" />
            <span className="text-sm font-medium text-blue-100">Contacted</span>
          </div>
          <span className="text-xl font-semibold">{safeContactedLeads}</span>
        </div>
      </div>
    </div>
  );
};

const UsersAdminsOverviewCard = ({ usersOverview }) => {
  // Add null checks and default values
  if (!usersOverview) {
    return (
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-100">Users & Admins</h3>
          <Users size={32} className="text-purple-200" />
        </div>
        <div className="text-center py-8">
          <p className="text-purple-200">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Safe access with default values
  const {
    totalUsers = 0,
    activeNormalUsers = 0,
    activeAdmins = 0,
    totalNormalUsers = 0,
    totalAdmins = 0
  } = usersOverview;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-100">Users & Admins</h3>
        <Users size={32} className="text-purple-200" />
      </div>

      {/* Total Users */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-400">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-purple-200" />
          <span className="text-base font-medium text-purple-100">Total Users</span>
        </div>
        <span className="text-3xl font-bold">{totalUsers}</span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Users */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCheck size={14} className="text-purple-200" />
            <span className="text-xs font-medium text-purple-100">Active Users</span>
          </div>
          <span className="text-xl font-bold">{activeNormalUsers}</span>
        </div>

        {/* Active Admins */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield size={14} className="text-purple-200" />
            <span className="text-xs font-medium text-purple-100">Active Admins</span>
          </div>
          <span className="text-xl font-bold">{activeAdmins}</span>
        </div>

        {/* Total Normal Users */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={14} className="text-purple-200" />
            <span className="text-xs font-medium text-purple-100">Normal Users</span>
          </div>
          <span className="text-xl font-bold">{totalNormalUsers}</span>
        </div>

        {/* Total Admins */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield size={14} className="text-purple-200" />
            <span className="text-xs font-medium text-purple-100">Total Admins</span>
          </div>
          <span className="text-xl font-bold">{totalAdmins}</span>
        </div>
      </div>
    </div>
  );
};

const DealsClosedCard = ({ dealsOverview }) => {
  // Add null checks and default values
  if (!dealsOverview) {
    return (
      <div className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white-100">Deals Closed</h3>
          <TrendingUp size={32} className="text-white/80" />
        </div>
        <div className="text-center py-8">
          <p className="text-white/80">Loading deals data...</p>
        </div>
      </div>
    );
  }

  // Safe access with default values
  const {
    "total close": totalClose = 0,
    closed = 0,
    dropped = 0
  } = dealsOverview;

  return (
    <div className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white-100">Deals Closed</h3>
        <TrendingUp size={32} className="text-white/80" />
      </div>

      <div className="space-y-4">
        {/* Total Closed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-white-200" />
            <span className="text-sm font-medium text-white/90">Total</span>
          </div>
          <span className="text-2xl font-bold">{totalClose}</span>
        </div>

        {/* Closed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-white/80" />
            <span className="text-sm font-medium text-white/90">Closed</span>
          </div>
          <span className="text-xl font-semibold">{closed}</span>
        </div>

        {/* Dropped */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-white-200" />
            <span className="text-sm font-medium text-white-100">Dropped</span>
          </div>
          <span className="text-xl font-semibold">{dropped}</span>
        </div>
      </div>
    </div>
  );
};


const PropertyOverviewCard = ({ propertyOverview }) => {
  // Add null checks and default values
  if (!propertyOverview) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-100">Property Overview</h3>
          <Building size={32} className="text-green-200" />
        </div>
        <div className="text-center py-8">
          <p className="text-green-200">Loading property data...</p>
        </div>
      </div>
    );
  }

  // Safe access with default values
  const {
    totalProperties = 0,
    "available for sale": availableForSale = 0,
    "available for rent": availableForRent = 0,
    "sold out": soldOut = 0,
    "rent out": rentOut = 0
  } = propertyOverview;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-100">Property Overview</h3>
        <Building size={32} className="text-green-200" />
      </div>

      {/* Total Properties */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-400">
        <div className="flex items-center gap-2">
          <Building size={18} className="text-green-200" />
          <span className="text-base font-medium text-green-100">Total</span>
        </div>
        <span className="text-3xl font-bold">{totalProperties}</span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Side - Available Properties */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Home size={14} className="text-green-200" />
              <span className="text-xs font-medium text-green-100">Available for Sale</span>
            </div>
            <span className="text-xl font-bold">{availableForSale}</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Key size={14} className="text-green-200" />
              <span className="text-xs font-medium text-green-100">Available for Rent</span>
            </div>
            <span className="text-xl font-bold">{availableForRent}</span>
          </div>
        </div>

        {/* Right Side - Completed Properties */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle size={14} className="text-green-200" />
              <span className="text-xs font-medium text-green-100">Sold Out</span>
            </div>
            <span className="text-xl font-bold">{soldOut}</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle size={14} className="text-green-200" />
              <span className="text-xs font-medium text-green-100">Rent Out</span>
            </div>
            <span className="text-xl font-bold">{rentOut}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, Icon, color }) => (
  <div className={`bg-gradient-to-r from-${color}-500 to-${color}-600 text-white p-6 rounded-xl shadow-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className={`text-sm font-medium text-${color}-100 mb-2`}>{title}</h3>
        <div className="text-3xl font-bold">{count}</div>
      </div>
      <Icon size={32} className={`text-${color}-200`} />
    </div>
  </div>
);

const EmptyEventMessage = () => (
  <div className="text-center py-12">
    <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
    <h4 className="text-lg font-medium text-gray-600 mb-2">No events scheduled for today</h4>
    <p className="text-gray-500">Your schedule is clear. Great time to catch up on other tasks!</p>
  </div>
);

const EmptyFollowUpMessage = () => (
  <div className="text-center py-12">
    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
    <h4 className="text-lg font-medium text-gray-600 mb-2">No follow-ups scheduled for today</h4>
    <p className="text-gray-500">All your follow-ups are up to date. Great job staying organized!</p>
  </div>
);

export default DashboardStats;