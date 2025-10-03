import React, { useState } from 'react';
import { Download, Eye, Edit, Trash2, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';
import { SearchService } from '../../../../core/services/SearchService';

const SearchResults = ({ results, searchKey, onClose }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'name', 'date', 'price'

  if (!results || !results.data || results.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          New Search
        </button>
      </div>
    );
  }

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === results.data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(results.data.map(item => item.id));
    }
  };

  const handleExport = (format) => {
    const exportData = SearchService.exportSearchResults(results, format);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search_results_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const sortedData = [...results.data].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || a.propertyName || '').localeCompare(b.name || b.propertyName || '');
      case 'date':
        return new Date(b.createdAt || b.createdDate || 0) - new Date(a.createdAt || a.createdDate || 0);
      case 'price':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0; // relevance - keep original order
    }
  });

  const renderPropertyCard = (property) => (
    <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(property.id)}
            onChange={() => handleSelectItem(property.id)}
            className="rounded"
          />
          <h3 className="font-semibold text-lg text-gray-800">
            {property.propertyName || 'Property'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{property.location || 'Location not specified'}</span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{property.type || 'Type not specified'}</span>
          <span>{property.bhk || 'BHK not specified'}</span>
          <span className="font-semibold text-green-600">₹{property.price?.toLocaleString() || 'Price not specified'}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Created: {new Date(property.createdAt || property.createdDate).toLocaleDateString()}</span>
        </div>
        
        {property.status && (
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              property.status === 'Available' ? 'bg-green-100 text-green-800' :
              property.status === 'Sold' ? 'bg-red-100 text-red-800' :
              property.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {property.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeadCard = (lead) => (
    <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(lead.id)}
            onChange={() => handleSelectItem(lead.id)}
            className="rounded"
          />
          <h3 className="font-semibold text-lg text-gray-800">
            {lead.name || 'Lead'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{lead.phone || 'Phone not specified'}</span>
        </div>
        
        {lead.email && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{lead.email}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Created: {new Date(lead.createdAt || lead.createdDate).toLocaleDateString()}</span>
        </div>
        
        {lead.status && (
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
              lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
              lead.status === 'Qualified' ? 'bg-green-100 text-green-800' :
              lead.status === 'Closed Won' ? 'bg-green-100 text-green-800' :
              lead.status === 'Closed Lost' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {lead.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderUserCard = (user) => (
    <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedItems.includes(user.id)}
            onChange={() => handleSelectItem(user.id)}
            className="rounded"
          />
          <h3 className="font-semibold text-lg text-gray-800">
            {user.name || 'User'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{user.email || 'Email not specified'}</span>
        </div>
        
        {user.phone && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{user.phone}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span>Role: {user.role || 'Role not specified'}</span>
        </div>
        
        {user.department && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Department: {user.department}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderCard = (item) => {
    switch (searchKey) {
      case 'property':
        return renderPropertyCard(item);
      case 'lead':
        return renderLeadCard(item);
      case 'user':
        return renderUserCard(item);
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
          <p className="text-gray-600">
            Found {results.total} {SearchService.SEARCH_KEYS[searchKey]?.label.toLowerCase()} 
            {results.filters && Object.keys(results.filters).length > 0 && (
              <span> with applied filters</span>
            )}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedItems.length === results.data.length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-600">
              Select All ({selectedItems.length}/{results.data.length})
            </span>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            {searchKey === 'property' && <option value="price">Sort by Price</option>}
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
        {sortedData.map(renderCard)}
      </div>

      {/* Pagination */}
      {results.total > 20 && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
            Previous
          </button>
          <span className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</span>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
