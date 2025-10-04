import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExcelEditor from '../components/sections/task/ExcelEditor';

const ExcelEditorPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const handleClose = () => {
    window.close();
  };

  const currentTaskId = taskId || sessionStorage.getItem('currentTaskId') || localStorage.getItem('currentTaskId');
  
  if (!currentTaskId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Task ID</h1>
          <div>
            <p className="text-gray-600 mb-4">No task ID provided.</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <ExcelEditor onClose={handleClose} />
      </div>
    </div>
  );
};

export default ExcelEditorPage;