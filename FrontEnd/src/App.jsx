import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, useNavigate, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import Pending from "./pages/Pending";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import TaskBoard from "./pages/TaskBoard";
import Analytics from "./pages/Analytics";
import PlannerDashboard from "./pages/PlannerDashboard";

const ProtectedLayout = ({ currentUser, logoutHandler }) => (
  <Layout user={currentUser} onLogout={() => logoutHandler()}>
    <Outlet></Outlet>
  </Layout>
);

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      return stored ? JSON.parse(stored) : null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const handleAuthSubmit = (data) => {
    const user = {
      email: data.email,
      name: data.name || "User",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || "User")}&background=random`,
    };
    setCurrentUser(user);
    navigate("/", { replace: true });
  };

  const handleLogout = async () => {
    await localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Login
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/signup")}
            ></Login>
          </div>
        }
      ></Route>
      <Route
        path="/signup"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Signup
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/login")}
            ></Signup>
          </div>
        }
      ></Route>
      <Route
        path="/forgot-password"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <ForgotPassword
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/signup")}
            ></ForgotPassword>
          </div>
        }
      ></Route>
      <Route
        path="/reset-password/:token"
        element={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <ResetPassword
              onSubmit={handleAuthSubmit}
              onSwitchMode={() => navigate("/signup")}
            ></ResetPassword>
          </div>
        }
      ></Route>
      <Route
        element={
          currentUser ? (
            <ProtectedLayout
              currentUser={currentUser}
              logoutHandler={handleLogout}
            />
          ) : (
            <Navigate to={"/login"} />
          )
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="plans" element={<Plans />} />
        <Route path="taskboard" element={<TaskBoard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route
          path="profile"
          element={
            <Profile
              user={currentUser}
              setCurrentUser={setCurrentUser}
              onLogout={handleLogout}
            />
          }
        />
      </Route>
      <Route
        path="*"
        element={<Navigate to={currentUser ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default App;
