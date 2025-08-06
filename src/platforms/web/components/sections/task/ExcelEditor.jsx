import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../../../../../core/hooks/useTasks';
import { useAuth } from '../../../../../shared/contexts/AuthContext';

const ExcelEditor = ({ onClose }) => {
  const { taskId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.companyId;
  const userId = user?.userId || user?.id;
  const role = user?.role;
  const {
    updateCell,
    deleteColumn,
    previewExcel
  } = useTasks(companyId, userId, role);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (taskId && companyId) {
      loadPreviewData();
    }
  }, [taskId, companyId]);

  const loadPreviewData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await previewExcel(taskId);
      if (result.success) {
        setData(result.data || []);
        setTaskTitle(`Task #${taskId}`);
      } else {
        setError(result.error || 'Failed to load preview');
      }
    } catch (err) {
      setError('Failed to load preview data');
    } finally {
      setLoading(false);
    }
  };

  const getColumnLetter = (colIndex) => {
    let letter = '';
    let tempIndex = colIndex;
    while (tempIndex >= 0) {
      letter = String.fromCharCode(65 + (tempIndex % 26)) + letter;
      tempIndex = Math.floor(tempIndex / 26) - 1;
    }
    return letter;
  };

  const handleCellUpdate = async (rowIndex, colIndex, newValue) => {
    const oldValue = data[rowIndex]?.[colIndex] || '';
    
    // Update local data immediately for better UX
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }
    newData[rowIndex][colIndex] = newValue;
    setData(newData);

    // Update on server
    try {
      const result = await updateCell(taskId, rowIndex, colIndex, newValue);
      if (!result.success) {
        // Revert on failure
        const revertedData = [...data];
        revertedData[rowIndex][colIndex] = oldValue;
        setData(revertedData);
        setError(result.error || 'Failed to update cell');
      }
    } catch (err) {
      // Revert on error
      const revertedData = [...data];
      revertedData[rowIndex][colIndex] = oldValue;
      setData(revertedData);
      setError('Failed to update cell');
    }
  };

  const handleDeleteColumn = async () => {
    if (selectedColumn === null) {
      setError('Please select a column to delete');
      return;
    }
    
    try {
      const result = await deleteColumn(taskId, selectedColumn);
      if (result.success) {
        // Remove column from local data
        const newData = data.map(row => {
          const newRow = [...row];
          newRow.splice(selectedColumn, 1);
          return newRow;
        });
        setData(newData);
        setSelectedColumn(null);
        setError('');
      } else {
        setError(result.error || 'Failed to delete column');
      }
    } catch (err) {
      setError('Failed to delete column');
    }
  };

  const handleColumnSelect = (colIndex) => {
    setSelectedColumn(selectedColumn === colIndex ? null : colIndex);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const maxCols = data.length > 0 ? Math.max(...data.map(row => row.length)) : 0;

  // Show loading if auth is still loading
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show error if no user data
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Please log in to access the Excel editor.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Excel Editor</h1>
          <p className="text-sm text-gray-600">{taskTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 border-b border-gray-200 flex-wrap">
        <button
          onClick={handleDeleteColumn}
          disabled={selectedColumn === null}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Column {selectedColumn !== null ? getColumnLetter(selectedColumn) : ''}
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={scrollLeft}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-auto p-4"
          >
            <table className="border-collapse min-w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-100 border border-gray-300 p-2 text-center font-semibold min-w-16">
                    Row
                  </th>
                  {Array.from({ length: maxCols }, (_, colIndex) => (
                    <th
                      key={colIndex}
                      className={`sticky top-0 border border-gray-300 p-2 text-center font-semibold min-w-20 cursor-pointer ${
                        selectedColumn === colIndex ? 'bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => handleColumnSelect(colIndex)}
                    >
                      <div className="flex flex-col items-center">
                        <span>{getColumnLetter(colIndex)}</span>
                        <div className="mt-1 text-xs text-gray-500">
                          {selectedColumn === colIndex ? 'Selected' : 'Click to select'}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="sticky left-0 z-10 bg-gray-50 border border-gray-300 p-2 text-center font-medium">
                      {rowIndex + 1}
                    </td>
                    {Array.from({ length: maxCols }, (_, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-gray-300 p-0 min-w-20 ${
                          selectedColumn === colIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <input
                          type="text"
                          value={row[colIndex] || ''}
                          onChange={(e) => {
                            const newData = [...data];
                            if (!newData[rowIndex]) newData[rowIndex] = [];
                            newData[rowIndex][colIndex] = e.target.value;
                            setData(newData);
                          }}
                          onBlur={(e) => handleCellUpdate(rowIndex, colIndex, e.target.value)}
                          className="w-full h-full p-2 border-none outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-400"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelEditor;