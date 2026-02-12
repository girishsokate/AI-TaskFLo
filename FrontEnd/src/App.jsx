import React, { useEffect, useState } from "react";
import { Routes, Route, Outlet, useNavigate, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/dashboard"; 
import Pending from "./pages/Pending";
import Complete from "./pages/Complete";


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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const ProtectedLayout = () => (
    <Layout user={currentUser} onLogout={handleLogout}>
      <Outlet></Outlet>
    </Layout>
  );

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
      <Route element={currentUser ? <ProtectedLayout /> : <Navigate to={"/login"} />}>
        <Route index element={<Dashboard />} />
        <Route path="pending" element={<Pending />} />
        <Route path="complete" element={<Complete />} />
      </Route>
      <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />}/>
    </Routes>
  );
};

export default App;
