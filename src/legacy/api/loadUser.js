import axios from './axios';

export const getUsersByCompanyId = async (companyId) => {
  const response = await axios.get(`/users/user-role/${companyId}`);
  return response.data;
};
