import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://dispatcher-backend-pbh9.onrender.com/api";
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://dispatcher-backend-pbh9.onrender.com";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

