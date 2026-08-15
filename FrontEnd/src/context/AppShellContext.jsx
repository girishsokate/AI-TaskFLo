import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTasks } from "../utils/axios";

const AppShellContext = createContext(null);

const todayISO = () => new Date().toISOString().slice(0, 10);

const normalizeTasks = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const AppShellProvider = ({ user, onLogout, children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getTasks();
      setTasks(normalizeTasks(data));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load tasks.");
      if (err.response?.status === 401) {
        onLogout?.();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const value = useMemo(
    () => ({
      user,
      onLogout,
      tasks,
      loading,
      error,
      refreshTasks,
      selectedDate,
      setSelectedDate,
    }),
    [
      user,
      onLogout,
      tasks,
      loading,
      error,
      refreshTasks,
      selectedDate,
    ],
  );

  return (
    <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
  );
};

export const useAppShell = () => {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return ctx;
};
