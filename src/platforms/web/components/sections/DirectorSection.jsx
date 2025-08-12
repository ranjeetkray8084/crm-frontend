import { useState, useEffect } from 'react';
import { Crown, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUsers } from '../../../../core/hooks/useUsers';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import UpdateUserModal from '../action/UpdateUserModal';
import DirectorTableRow from './DirectorTableRow';

const DirectorSection = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const role = user?.role;
  const userId = user?.userId || user?.id;

  // Use useUsers hook for director management actions
  const {
    users: directors,
    loading,
    error,
    activateUser,
    deactivateUser,
    getUsersWithRole
  } = useUsers(role === 'DEVELOPER' ? null : companyId, role, userId);

  const [search, setSearch] = useState('');
  const [selectedDirector, setSelectedDirector] = useState(null);

  // Load directors based on current user's role
  const loadDirectorsData = async () => {
    // For DEVELOPER, we don't need companyId since they see all directors across companies
    if (role === 'DEVELOPER') {
      if (!role || !userId) {
        return;
      }
    } else {
      // For other roles, we need companyId
      if (!companyId || !role || !userId) {
        return;
      }
    }

    try {
      if (role === 'DEVELOPER') {
        // Developer can see all DIRECTOR role users across all companies
        await getUsersWithRole('DIRECTOR');
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    loadDirectorsData();
  }, [companyId, role, userId]);

  const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

  const displayedDirectors = directors.filter((director) => {
    const fields = [director.name, director.email, director.phone, director.companyName];
    return fields.some((field) => field?.toString().toLowerCase().includes(search));
  });

  if (role !== 'DEVELOPER') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Crown size={48} className="mx-auto mb-4 text-gray-300" />
          <p>You don't have permission to view all directors.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      {/* Update Director Modal */}
      {selectedDirector && (
        <UpdateUserModal
          user={selectedDirector}
          onClose={() => setSelectedDirector(null)}
          onUpdate={() => {
            setSelectedDirector(null);
            loadDirectorsData();
          }}
        />
      )}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="text-gray-500" size={32} />
          <h2 className="text-xl font-semibold text-gray-800">
            Director Management
            <span className="text-sm text-gray-500 ml-2">({displayedDirectors.length} directors)</span>
          </h2>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search directors..."
            value={search}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white p-4 rounded-xl shadow border border-gray-200 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full table-auto border-collapse bg-white">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="border-b px-6 py-4 text-left font-semibold">Name</th>
                  <th className="border-b px-6 py-4 text-left font-semibold">Email</th>
                  <th className="border-b px-6 py-4 text-left font-semibold">Phone</th>
                  <th className="border-b px-6 py-4 text-left font-semibold">Company</th>
                  <th className="border-b px-6 py-4 text-left font-semibold">Status</th>
                  <th className="border-b px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedDirectors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <Crown size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No directors found.</p>
                    </td>
                  </tr>
                ) : (
                  displayedDirectors.map((director) => (
                    <DirectorTableRow
                      key={director.userId}
                      director={director}
                      searchTerm={search}
                      onUpdate={setSelectedDirector}
                      onActivate={activateUser}
                      onDeactivate={deactivateUser}
                      isDeveloper={role === 'DEVELOPER'}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DirectorSection;