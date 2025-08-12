import axios from "./axios";

export const loginUser = async (credentials) => {
  const res = await axios.post("/api/auth/login", credentials);
  return res.data; // contains token and user info
};
