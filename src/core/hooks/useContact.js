// Contact Hook - Reusable for Web & Mobile
import { useState } from 'react';
import { ContactService } from '../services/contact.service';

export const useContact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Send contact message
  const sendContactMessage = async (contactData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ContactService.sendContactMessage(contactData);
      if (result.success) {
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to send message';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear error state
  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    sendContactMessage,
    clearError
  };
};