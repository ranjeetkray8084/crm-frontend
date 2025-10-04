export const getToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");

export const getUser = () => {
  const user = sessionStorage.getItem("user") || localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
