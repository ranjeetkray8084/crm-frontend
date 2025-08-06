import axios from './axios';

export const getAdminsByCompanyId = async (companyId) => {
  const response = await axios.get(`/users/admin-role/${companyId}`);
  return response.data;
};
