import { useState, useEffect } from 'react';
import { Building2, Search, Plus, MoreVertical, UserCheck, UserX } from 'lucide-react';
import ThreeDotMenu from '../common/ThreeDotMenu';
import { motion } from 'framer-motion';
import { useCompany } from '../../../../core/hooks/useCompany';
import { useAuth } from '../../../../shared/contexts/AuthContext';

const CompaniesSection = () => {
    const { user } = useAuth();
    const { companies, loading, loadAllCompanies, revokeCompany, unrevokeCompany } = useCompany();
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        if (user?.role === 'DEVELOPER') {
            loadAllCompanies();
        }
    }, [user?.role, loadAllCompanies]);

    const handleSearch = (e) => setSearch(e.target.value.toLowerCase());

    const displayedCompanies = companies.filter((company) => {
        const fields = [company.name, company.email, company.phone];
        return fields.some((field) => field?.toString().toLowerCase().includes(search));
    });

    const handleToggleStatus = async (companyId, isActive) => {
        setActionLoading(prev => ({ ...prev, [companyId]: true }));

        try {
            if (isActive) {
                await revokeCompany(companyId);
            } else {
                await unrevokeCompany(companyId);
            }
            await loadAllCompanies(); // Refresh the list
        } catch (error) {
    
        } finally {
            setActionLoading(prev => ({ ...prev, [companyId]: false }));
        }
    };

    if (user?.role !== 'DEVELOPER') {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                    <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>You don't have permission to view companies.</p>
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
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white p-6 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="text-gray-500" size={32} />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Companies Management
                            <span className="text-sm text-gray-500 ml-2">({displayedCompanies.length} companies)</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={search}
                            onChange={handleSearch}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
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
                                    <th className="border-b px-6 py-4 text-left font-semibold">Company Name</th>
                                    <th className="border-b px-6 py-4 text-left font-semibold">Email</th>
                                    <th className="border-b px-6 py-4 text-left font-semibold">Phone</th>
                                    <th className="border-b px-6 py-4 text-left font-semibold">Max Users</th>
                                    <th className="border-b px-6 py-4 text-left font-semibold">Max Admins</th>
                                    <th className="border-b px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="border-b px-6 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedCompanies.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-gray-500">
                                            <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No companies found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    displayedCompanies.map((company) => (
                                        <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="border-b px-6 py-4">
                                                <div className="font-medium text-gray-900">{company.name}</div>
                                            </td>
                                            <td className="border-b px-6 py-4 text-gray-600">{company.email}</td>
                                            <td className="border-b px-6 py-4 text-gray-600">{company.phone}</td>
                                            <td className="border-b px-6 py-4 text-gray-600">{company.maxUsers || 'N/A'}</td>
                                            <td className="border-b px-6 py-4 text-gray-600">{company.maxAdmins || 'N/A'}</td>
                                            <td className="border-b px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {company.status === 'active' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="border-b px-2 py-2 text-center">
                                                <ThreeDotMenu
                                                    item={company}
                                                    actions={[
                                                        company.status === 'active'
                                                            ? { 
                                                                label: 'Deactivate Company', 
                                                                icon: <UserX size={14} />, 
                                                                onClick: () => handleToggleStatus(company.id, true),
                                                                danger: true
                                                              }
                                                            : { 
                                                                label: 'Activate Company', 
                                                                icon: <UserCheck size={14} />, 
                                                                onClick: () => handleToggleStatus(company.id, false)
                                                              }
                                                    ]}
                                                />
                                            </td>
                                        </tr>
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

export default CompaniesSection;