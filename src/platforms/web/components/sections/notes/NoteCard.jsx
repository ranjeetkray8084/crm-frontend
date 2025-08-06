import React from 'react';

const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdatePriority,
  onAddRemark,
  onViewRemarks,
}) => {
  const getPriorityClass = (priority) => {
    return 'text-white border-none';
  };

  const getPriorityBg = (priority) => {
    switch (priority) {
      case 'PRIORITY_A': return '#f44336'; // Red
      case 'PRIORITY_B': return '#ff9800'; // Orange
      case 'PRIORITY_C': return '#4caf50'; // Green
      default: return '#777';
    }
  };

  const getStatusClass = (status) => {
    return 'text-white border-none';
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'NEW': return '#f0ad4e'; // Yellow/Orange
      case 'PROCESSING': return '#5bc0de'; // Light Blue
      case 'COMPLETED': return '#d9534f'; // Red
      default: return '#ccc';
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    const date = new Date(dt);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatCreatedFor = (note) => {
    if (!note.visibility) return 'Unknown';
    
    switch (note.visibility) {
      case 'ONLY_ME':
        return 'Only Me';
      case 'ALL_USERS':
        return 'All Users';
      case 'ALL_ADMIN':
        return 'All Admins';
      case 'SPECIFIC_USERS':
      case 'SPECIFIC_ADMIN':
        if (note.visibleUserNames && note.visibleUserNames.length > 0) {
          return note.visibleUserNames.join(', ');
        } else if (note.visibleUserIds && note.visibleUserIds.length > 0) {
          return `${note.visibleUserIds.length} user(s)`;
        }
        return 'Specific Users';
      default:
        return note.visibility;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">
        {note?.content || 'No content available'}
      </p>

      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <select
          value={note?.status || 'NEW'}
          onChange={(e) => onUpdateStatus(note.id, e.target.value)}
          className={`p-2 rounded text-sm ${getStatusClass(note?.status)}`}
          style={{ backgroundColor: getStatusBg(note?.status) }}
        >
          <option value="NEW">NEW</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <select
          value={note?.priority || 'PRIORITY_C'}
          onChange={(e) => onUpdatePriority(note.id, e.target.value)}
          className={`p-2 rounded text-sm ${getPriorityClass(note?.priority)}`}
          style={{ backgroundColor: getPriorityBg(note?.priority) }}
        >
          <option value="PRIORITY_A">Priority A</option>
          <option value="PRIORITY_B">Priority B</option>
          <option value="PRIORITY_C">Priority C</option>
        </select>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Type: <span className="font-medium">{note?.typeStr || 'Note'}</span></p>
        <p>Created By: <span className="font-medium">{note?.createdBy?.name || note?.createdBy?.username || 'Unknown'}</span></p>
        <p>Created For: <span className="font-medium">{formatCreatedFor(note)}</span></p>
        <p>Created At: <span className="font-medium">{formatDateTime(note?.createdAt)}</span></p>
        <p>Scheduled: <span className="font-medium">{formatDateTime(note?.dateTime)}</span></p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => onEdit(note.id)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Delete
        </button>
        <button
          onClick={() => onAddRemark(note.id)}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        >
          Add Remark
        </button>
        <button
          onClick={() => onViewRemarks(note.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        >
          View Remarks
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
