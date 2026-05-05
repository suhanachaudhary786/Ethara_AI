import axios from "axios";
import { API_URL } from "./config";

const apiClient = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use((response) => response.data, (err) => Promise.reject(new Error(err.response?.data?.message || err.message || "Request failed")));
export default apiClient;
