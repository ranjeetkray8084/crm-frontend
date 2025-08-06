import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

const TaskUploadForm = ({ onUpload, loading = false }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  const resetFileInput = () => {
    const fileInput = document.getElementById('excelFile');
    if (fileInput) fileInput.value = '';
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');

    if (!allowedTypes.includes(selectedFile.type) &&
        !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('❌ Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('❌ File size must be under 10MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(['dragenter', 'dragover'].includes(e.type));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('❌ Task title is required');
      return;
    }

    if (!file) {
      setError('❌ Please select an Excel file');
      return;
    }

    const taskData = {
      title: title.trim(),
      file
    };

    const result = await onUpload(taskData);
    if (result?.success) {
      setTitle('');
      setFile(null);
      resetFileInput();
      setError('');
    } else {
      setError(result?.error || '❌ Upload failed');
    }
  };

  const removeFile = () => {
    setFile(null);
    resetFileInput();
    setError('');
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* File Drop/Upload Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excel File</label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="excelFile"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />

            {!file ? (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls) under 10MB</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !title.trim() || !file}
          className="w-full flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Task
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskUploadForm;
