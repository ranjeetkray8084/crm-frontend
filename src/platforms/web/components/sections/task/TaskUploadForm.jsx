import React, { useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const TaskUploadForm = ({ onUpload, onCancel, loading = false }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [fileDimensions, setFileDimensions] = useState(null);

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  const resetFileInput = () => {
    const fileInput = document.getElementById('excelFile');
    if (fileInput) fileInput.value = '';
  };

  const validateAndSetFile = async (selectedFile) => {
    setError('');

    console.log('TaskUploadForm: Validating file:', {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size
    });

    if (!allowedTypes.includes(selectedFile.type) &&
        !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      console.error('TaskUploadForm: Invalid file type');
      setError('❌ Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      console.error('TaskUploadForm: File too large');
      setError('❌ File size must be under 10MB');
      return;
    }

    // Validate Excel file dimensions
    try {
      console.log('TaskUploadForm: Validating Excel dimensions');
      const dimensions = await validateExcelDimensions(selectedFile);
      console.log('TaskUploadForm: Dimension validation result:', dimensions);
      
      if (!dimensions.valid) {
        console.error('TaskUploadForm: Dimension validation failed:', dimensions.error);
        setError(`❌ ${dimensions.error}`);
        return;
      }
      
      console.log('TaskUploadForm: File validation successful');
      
      // Auto-populate title with filename (without extension) - ONLY after validation passes
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      if (!title.trim()) {
        setTitle(fileNameWithoutExt);
        console.log('TaskUploadForm: Auto-populated title from filename:', fileNameWithoutExt);
      }
      
      setFile(selectedFile);
      setFileDimensions({ columns: dimensions.columns, rows: dimensions.rows });
    } catch (error) {
      console.error('TaskUploadForm: File validation error:', error);
      setError('❌ Error validating file dimensions. Please try again.');
    }
  };

  const validateExcelDimensions = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const maxRow = range.e.r + 1; // +1 because range is 0-indexed
          const maxCol = range.e.c + 1; // +1 because range is 0-indexed
          
  
          
          if (maxCol > 6) {
            resolve({
              valid: false,
              error: `File has ${maxCol} columns. Maximum allowed is 6 columns.`
            });
            return;
          }
          
          if (maxRow > 600) {
            resolve({
              valid: false,
              error: `File has ${maxRow} rows. Maximum allowed is 600 rows.`
            });
            return;
          }
          
          resolve({ valid: true, columns: maxCol, rows: maxRow });
        } catch (error) {
          console.error('Excel parsing error:', error);
          resolve({
            valid: false,
            error: 'Unable to read Excel file. Please ensure it\'s a valid Excel file.'
          });
        }
      };
      
      reader.onerror = () => {
        resolve({
          valid: false,
          error: 'Error reading file. Please try again.'
        });
      };
      
      reader.readAsArrayBuffer(file);
    });
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

    console.log('TaskUploadForm: Submit started');

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

    console.log('TaskUploadForm: Calling onUpload with:', {
      title: taskData.title,
      fileName: taskData.file.name,
      fileSize: taskData.file.size,
      fileType: taskData.file.type
    });

    try {
      const result = await onUpload(taskData);
      console.log('TaskUploadForm: Upload result:', result);
      
      if (result?.success) {
        setTitle('');
        setFile(null);
        setFileDimensions(null);
        resetFileInput();
        setError('');
      } else {
        const errorMsg = result?.error || '❌ Upload failed';
        console.error('TaskUploadForm: Upload failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('TaskUploadForm: Upload exception:', error);
      setError('❌ Upload error: ' + error.message);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileDimensions(null);
    resetFileInput();
    setError('');
    // Clear title when file is removed
    setTitle('');
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
                <p className="text-xs text-gray-500">Excel files (.xlsx, .xls) under 10MB, max 6 columns × 600 rows</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                      {fileDimensions && (
                        <span className="ml-2 text-green-600">
                          • {fileDimensions.columns} cols × {fileDimensions.rows} rows
                        </span>
                      )}
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim() || !file}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
        </div>
      </form>
    </div>
  );
};

export default TaskUploadForm;
