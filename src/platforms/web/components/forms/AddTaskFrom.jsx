import React, { useCallback } from 'react';
import TaskUploadForm from '../sections/task/TaskUploadForm';
import { useTasks } from '../../../../core/hooks/useTasks';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { customAlert } from '../../../../core/utils/alertUtils';

const AddTaskForm = () => {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.companyId;
  const userId = user?.userId || user?.id;
  const role = user?.role;

  const { uploadExcelFile, loading } = useTasks(companyId, userId, role);

  // ✅ Always define as a stable function using useCallback
  const handleUpload = useCallback(async (taskData) => {
    if (typeof uploadExcelFile !== 'function') {
      customAlert('❌ Upload function not available.');
      return { success: false, error: 'Upload handler not ready' };
    }

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
  }, [uploadExcelFile, userId]);

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

  return (
    <div className="max-w-2xl mx-auto">
      <TaskUploadForm
        onUpload={handleUpload}
        loading={loading}
      />
    </div>
  );
};

export default AddTaskForm;
