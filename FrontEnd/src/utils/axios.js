import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Planner
export const getPlannerByDate = (date) => api.get(`/planner/${date}`);
export const generatePlanner = (data) => api.post("/planner/generate", data);

// Tasks
export const getTasks = () => api.get("/tasks/ct");
export const createTask = (data) => api.post("/tasks/ct", data);
export const updateTask = (id, data) => api.put(`/tasks/${id}/ct`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}/ct`);
export const updateTaskStatus = (id, status) =>
  api.put(`/tasks/${id}/ut`, { status });

export default api;
