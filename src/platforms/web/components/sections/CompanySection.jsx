import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompanies } from '../../../../core/hooks/useCompanies';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import AddCompanyModal from '../modals/AddCompanyModal';

const CompanySection = () => {
  const { user } = useAuth();
  const role = user?.role;

  const {
    companies,
    loading,
    error,
    loadCompanies,
    addCompany,
    deleteCompany,
    revokeCompany,
    unrevokeCompany,
    getAllCompanies
  } = useCompanies(role);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) => {
    const search = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(search) ||
      company.email?.toLowerCase().includes(search) ||
      company.phone?.toLowerCase().includes(search) ||
      company.address?.toLowerCase().includes(search)
    );
  });

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-100 rounded-lg">
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
    >
      {/* Different headers based on role */}
      {role === 'DEVELOPER' ? (
        /* Full Header for Developer */
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Companies Management</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Plus size={16} />
              Add Company
            </button>
          </div>
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ) : (
        /* Simple Header for other roles */
        <div className="sticky top-0 bg-white z-10 pb-4">
          <div className="flex justify-center items-center gap-3 mb-3">
            <Building2 className="text-gray-500" size={28} />
            <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4 px-4 py-2 border border-gray-300 rounded w-full max-w-md"
            />
          </div>
        </div>
      )}

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Different tables based on role */}
          {role === 'DEVELOPER' ? (
            /* Full Company Management Table for Developer */
            <>
              <div className="hidden md:block max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full table-auto border-collapse bg-white">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-sm text-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Company Name</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Email</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Phone</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Address</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Status</th>
                      <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-gray-500">
                          No companies found.
                        </td>
                      </tr>
                    ) : (
                      filteredCompanies.map((company) => {
                        const isActive = company.status === true || company.status === 'active';
                        return (
                          <tr key={company.id} className="text-sm text-gray-700 hover:bg-blue-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{company.name}</td>
                            <td className="px-6 py-4 text-gray-600">{company.email}</td>
                            <td className="px-6 py-4 text-gray-600">{company.phone}</td>
                            <td className="px-6 py-4 text-gray-600">{company.address}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {isActive ? (
                                  <button
                                    onClick={() => revokeCompany(company.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                    title="Revoke Access"
                                  >
                                    <Ban size={16} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => unrevokeCompany(company.id)}
                                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                                    title="Restore Access"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteCompany(company.id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Company"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View for Developer */}
              <div className="space-y-4 md:hidden">
                {filteredCompanies.length === 0 ? (
                  <p className="text-gray-500 text-center">No companies found.</p>
                ) : (
                  filteredCompanies.map((company) => {
                    const isActive = company.status === true || company.status === 'active';
                    return (
                      <div
                        key={company.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="font-semibold text-lg mb-3 text-gray-800">
                          {company.name}
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Email:</span>
                            <span className="text-gray-700">{company.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Phone:</span>
                            <span className="text-gray-700">{company.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Address:</span>
                            <span className="text-gray-700">{company.address}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-500 w-16">Status:</span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              isActive
                                ? revokeCompany(company.id)
                                : unrevokeCompany(company.id)
                            }
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white ${
                              isActive
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            }`}
                          >
                            {isActive ? "Revoke" : "Restore"}
                          </button>
                          <button
                            onClick={() => deleteCompany(company.id)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Simple Company Info Table for other roles */
            <table id="companyTable" className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Company Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Phone</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No company information found.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{company.name}</td>
                      <td className="border border-gray-300 px-4 py-2">{company.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{company.phone}</td>
                      <td className="border border-gray-300 px-4 py-2">{company.address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Add Company Modal - Only for Developer */}
      {showAddModal && role === 'DEVELOPER' && (
        <AddCompanyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={addCompany}
        />
      )}
    </motion.div>
  );
};

export default CompanySection;