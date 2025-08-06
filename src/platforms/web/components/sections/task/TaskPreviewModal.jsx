import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Undo, ChevronLeft, ChevronRight } from 'lucide-react';

const TaskPreviewModal = ({ 
  isOpen, 
  onClose, 
  taskId, 
  companyId,
  updateCell,
  addNewRow,
  addNewColumn,
  deleteSelectedColumns,
  undoLastAction,
  previewExcel
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(new Set());
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && taskId && companyId) {
      loadPreviewData();
    }
  }, [isOpen, taskId, companyId]);

  const loadPreviewData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await previewExcel(taskId);
      if (result.success) {
        setData(result.data || []);
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
    
    // Add to undo stack
    setUndoStack(prev => [...prev, { 
      type: 'update', 
      row: rowIndex, 
      col: colIndex, 
      oldValue, 
      newValue 
    }]);

    // Update local data immediately
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

  const handleAddRow = async () => {
    try {
      const result = await addNewRow(taskId);
      if (result.success) {
        // Add empty row to local data
        const maxCols = data.length > 0 ? Math.max(...data.map(row => row.length)) : 5;
        const newRow = Array(maxCols).fill('');
        setData(prev => [...prev, newRow]);
      } else {
        setError(result.error || 'Failed to add row');
      }
    } catch (err) {
      setError('Failed to add row');
    }
  };

  const handleAddColumn = async () => {
    try {
      const result = await addNewColumn(taskId);
      if (result.success) {
        // Add empty column to all rows
        const newData = data.map(row => [...row, '']);
        if (newData.length === 0) {
          newData.push(['']);
        }
        setData(newData);
      } else {
        setError(result.error || 'Failed to add column');
      }
    } catch (err) {
      setError('Failed to add column');
    }
  };

  const handleDeleteColumns = async () => {
    if (selectedColumns.size === 0) {
      setError('Please select columns to delete');
      return;
    }

    const columnIndices = Array.from(selectedColumns).sort((a, b) => b - a);
    
    try {
      const result = await deleteSelectedColumns(taskId, columnIndices);
      if (result.success) {
        // Remove columns from local data
        const newData = data.map(row => {
          const newRow = [...row];
          columnIndices.forEach(colIndex => {
            newRow.splice(colIndex, 1);
          });
          return newRow;
        });
        setData(newData);
        setSelectedColumns(new Set());
      } else {
        setError(result.error || 'Failed to delete columns');
      }
    } catch (err) {
      setError('Failed to delete columns');
    }
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    if (lastAction.type === 'update') {
      const newData = [...data];
      newData[lastAction.row][lastAction.col] = lastAction.oldValue;
      setData(newData);
    }
  };

  const handleColumnSelect = (colIndex) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(colIndex)) {
      newSelected.delete(colIndex);
    } else {
      newSelected.add(colIndex);
    }
    setSelectedColumns(newSelected);
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

  if (!isOpen) return null;

  const maxCols = data.length > 0 ? Math.max(...data.map(row => row.length)) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-screen m-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Excel Editor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-4 bg-gray-50 border-b border-gray-200 flex-wrap">
            <button
              onClick={handleAddRow}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </button>
            
            <button
              onClick={handleAddColumn}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </button>
            
            <button
              onClick={handleDeleteColumns}
              disabled={selectedColumns.size === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected ({selectedColumns.size})
            </button>
            
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </button>

            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={scrollLeft}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mt-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              {error}
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
                        S.No
                      </th>
                      {Array.from({ length: maxCols }, (_, colIndex) => (
                        <th
                          key={colIndex}
                          className="sticky top-0 bg-gray-100 border border-gray-300 p-2 text-center font-semibold min-w-20"
                        >
                          <div className="flex flex-col items-center">
                            <span>{data[0]?.[colIndex] || getColumnLetter(colIndex)}</span>
                            <input
                              type="checkbox"
                              checked={selectedColumns.has(colIndex)}
                              onChange={() => handleColumnSelect(colIndex)}
                              className="mt-1 scale-110"
                            />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => {
                      // Skip first row if it's used as header
                      const isHeaderRow = rowIndex === 0 && data[0]?.some(cell => cell !== null && cell !== '');
                      if (isHeaderRow) return null;

                      return (
                        <tr key={rowIndex}>
                          <td className="sticky left-0 z-10 bg-gray-50 border border-gray-300 p-2 text-center font-medium">
                            {isHeaderRow ? rowIndex : rowIndex + 1}
                          </td>
                          {Array.from({ length: maxCols }, (_, colIndex) => (
                            <td
                              key={colIndex}
                              className="border border-gray-300 p-0 min-w-20"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreviewModal;