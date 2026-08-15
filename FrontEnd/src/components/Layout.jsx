import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {
  AppShellProvider,
  useAppShell,
} from "../context/AppShellContext";

const AppShell = () => {
  const {
    user,
    onLogout,
    tasks,
    loading,
    error,
    refreshTasks,
    selectedDate,
    setSelectedDate,
  } = useAppShell();

  if (loading && tasks.length === 0) {
    return (
      <div className="app-shell__loading">
        <div className="app-shell__spinner" aria-label="Loading" />
      </div>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <div className="app-shell__error">
        <div className="app-shell__error-card">
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Error loading tasks
          </p>
          <p style={{ fontSize: "0.875rem" }}>{error}</p>
          <button type="button" onClick={refreshTasks}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} tasks={tasks} />
      <div className="app-shell__main">
        <Navbar
          user={user}
          onLogout={onLogout}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Layout = ({ user, onLogout }) => (
  <AppShellProvider user={user} onLogout={onLogout}>
    <AppShell />
  </AppShellProvider>
);

export default Layout;
