/**
 * Connection Troubleshooter Component
 * Helps users diagnose and fix backend connection issues
 */

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw, Server, Globe } from 'lucide-react';
import { backendHealthCheck } from '../../core/services/BackendHealthCheck.js';

const ConnectionTroubleshooter = ({ isOpen, onClose, onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    setSuggestions([]);

    try {
      console.log('🔍 Running connection diagnostic...');
      const status = await backendHealthCheck.getConnectionStatus();
      setConnectionStatus(status);

      if (!status.connected) {
        const fixResult = await backendHealthCheck.fixBackendConnection();
        if (fixResult.suggestions) {
          setSuggestions(fixResult.suggestions);
        }
      }
    } catch (err) {
      setError(err.message);
      setSuggestions([
        'Check your internet connection',
        'Verify backend server is running',
        'Try refreshing the page',
        'Contact support if issue persists'
      ]);
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    checkConnection();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Connection Diagnostic
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            {isChecking ? (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            ) : connectionStatus?.connected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}

            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {isChecking
                  ? 'Checking connection...'
                  : connectionStatus?.connected
                    ? 'Connection successful'
                    : 'Connection failed'
                }
              </p>
              {connectionStatus?.url && (
                <p className="text-sm text-gray-600">
                  Connected to: {connectionStatus.url}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Troubleshooting Steps:</h4>
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Backend URLs Tested */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Backend URLs Tested:</h4>
            <div className="space-y-1">
              <div className="text-sm text-blue-700">• https://app.leadstracker.in</div>
              <div className="text-sm text-blue-700">• http://localhost:8080</div>
              <div className="text-sm text-blue-700">• http://127.0.0.1:8080</div>
              <div className="text-sm text-blue-700">• http://localhost:3000</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleRetry}
              disabled={isChecking}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Retry Connection'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>

          {/* Network Info */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>
                {navigator.onLine ? 'Online' : 'Offline'} •
                Connection: {navigator.connection?.effectiveType || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTroubleshooter;
