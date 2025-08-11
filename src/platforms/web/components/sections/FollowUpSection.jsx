import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, Filter, RefreshCw, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import ThreeDotMenu from '../common/ThreeDotMenu';
import { useFollowUp } from '../../../../core/hooks/useFollowUp';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import AddFollowUpModal from './LeadSection/action/AddFollowUpModal';

const FollowUpSection = () => {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const {
    followUps,
    loading,
    error,
    loadFollowUps,
    updateFollowUp,
    deleteFollowUp,
    clearError
  } = useFollowUp(companyId);

  useEffect(() => {
    if (companyId) {
      loadFollowUps();
    }
  }, [companyId, loadFollowUps]);

  const handleRefresh = () => {
    loadFollowUps();
  };

  const handleStatusUpdate = async (followUpId, newStatus) => {
    try {
      const followUp = followUps.find(fu => fu.id === followUpId);
      if (followUp) {
        await updateFollowUp({
          ...followUp,
          status: newStatus
        });
      }
    } catch (error) {
      
    }
  };

  const handleDelete = async (followUpId) => {
    if (window.confirm('Are you sure you want to delete this follow-up?')) {
      try {
        await deleteFollowUp(followUpId);
      } catch (error) {

      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'CANCELLED':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const isOverdue = (followupDate) => {
    return new Date(followupDate) < new Date() && followupDate;
  };

  // Filter follow-ups based on search and filters
  const filteredFollowUps = followUps.filter(followUp => {
    const matchesSearch = !searchTerm || 
      followUp.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      followUp.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || followUp.status === statusFilter;
    
    const matchesDate = dateFilter === 'ALL' || (() => {
      const today = new Date();
      const followUpDate = new Date(followUp.followupDate);
      
      switch (dateFilter) {
        case 'TODAY':
          return followUpDate.toDateString() === today.toDateString();
        case 'OVERDUE':
          return followUpDate < today;
        case 'UPCOMING':
          return followUpDate > today;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(a.followupDate) - new Date(b.followupDate));

  const stats = {
    total: followUps.length,
    pending: followUps.filter(fu => fu.status === 'PENDING').length,
    completed: followUps.filter(fu => fu.status === 'COMPLETED').length,
    overdue: followUps.filter(fu => isOverdue(fu.followupDate) && fu.status === 'PENDING').length
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-4">
      <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm w-full max-w-[1200px] h-fit">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Follow-up Management</h2>
            <p className="text-gray-600">Track and manage all your follow-ups</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Follow-up
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-800">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-yellow-600" size={20} />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="text-red-600" size={20} />
              <span className="text-sm font-medium text-red-800">Overdue</span>
            </div>
            <div className="text-2xl font-bold text-red-900">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search follow-ups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="OVERDUE">Overdue</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={clearError}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Follow-ups List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading follow-ups...</p>
          </div>
        ) : filteredFollowUps.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No follow-ups found</h3>
            <p className="text-gray-500">
              {followUps.length === 0 
                ? "You haven't created any follow-ups yet." 
                : "No follow-ups match your current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFollowUps.map((followUp) => (
              <div 
                key={followUp.id} 
                className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                  isOverdue(followUp.followupDate) && followUp.status === 'PENDING' 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(followUp.status)}
                      <select
                        value={followUp.status || 'PENDING'}
                        onChange={(e) => handleStatusUpdate(followUp.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(followUp.status)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(followUp.followupDate)}
                        {isOverdue(followUp.followupDate) && followUp.status === 'PENDING' && (
                          <span className="ml-2 text-red-600 font-medium">(Overdue)</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-900">
                        {followUp.lead?.name || 'Unknown Lead'}
                      </h4>
                      <p className="text-gray-600">{followUp.note}</p>
                    </div>
                    
                    {followUp.nextFollowup && (
                      <div className="text-sm text-gray-600">
                        <Clock size={14} className="inline mr-1" />
                        Next: {formatDateTime(followUp.nextFollowup)}
                      </div>
                    )}
                  </div>
                  
                  <ThreeDotMenu
                    item={followUp}
                    actions={[
                      { label: 'Edit Follow-up', icon: <Edit size={14} />, onClick: () => {/* Add edit functionality */} },
                      { label: 'Delete Follow-up', icon: <Trash2 size={14} />, onClick: () => handleDelete(followUp.id), danger: true }
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Follow-up Modal */}
        <AddFollowUpModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedLead(null);
          }}
          onAddFollowUp={() => {
            setShowAddModal(false);
            setSelectedLead(null);
            handleRefresh();
          }}
          lead={selectedLead}
        />
      </div>
    </div>
  );
};

export default FollowUpSection;