// src/api/leadApi.js
import axios from './axios';

export const addLead = async (leadData) => {
  const response = await axios.post('/lead', leadData); // Adjust endpoint if needed
  return response.data;
};
