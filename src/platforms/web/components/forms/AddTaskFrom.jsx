import React, { useCallback, useState } from 'react';
import TaskUploadForm from '../sections/task/TaskUploadForm';
import { useTasks } from '../../../../core/hooks/useTasks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { customAlert } from '../../../../core/utils/alertUtils';

const AddTaskForm = () => {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.companyId;
  const userId = user?.userId || user?.id;
  const role = user?.role;


  React.useEffect(() => {
    if (user && !companyId) {
      console.error('User authenticated but missing companyId:', user);
    }
  }, [user, companyId]);

  const { uploadExcelFile } = useTasks(companyId, userId, role);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ✅ Always define as a stable function using useCallback
  const handleUpload = useCallback(async (taskData) => {
    if (!companyId) {
      customAlert('❌ Company ID is required. Please log in again.');
      return { success: false, error: 'Missing company ID' };
    }

    if (!userId) {
      customAlert('❌ User ID is required. Please log in again.');
      return { success: false, error: 'Missing user ID' };
    }

    if (typeof uploadExcelFile !== 'function') {
      customAlert('❌ Upload function not available.');
      return { success: false, error: 'Upload handler not ready' };
    }

    setUploadLoading(true);
    try {
      const result = await uploadExcelFile({
        ...taskData,
        uploadedBy: userId  // ✅ Ensure backend receives uploadedBy param
      });

      if (result.success) {
        customAlert('✅ Task uploaded successfully!');
      } else {
        customAlert('❌ Failed to upload task: ' + (result.error || 'Unknown error'));
      }

      return result;
    } finally {
      setUploadLoading(false);
    }
  }, [uploadExcelFile, userId, companyId]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Please log in to upload tasks.</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Company information is missing. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <TaskUploadForm
        onUpload={handleUpload}
        loading={uploadLoading}
      />
    </div>
  );
};

export default AddTaskForm;
