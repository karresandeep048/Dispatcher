import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import LiveTracking from "./pages/LiveTracking";
import Orders from "./pages/Orders";
import Earnings from "./pages/Earnings";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

const Layout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      {user && <Navbar />}
      <main>{children}</main>
    </div>
  );
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? (
    <Navigate to="/admin" replace />
  ) : (
    <Navigate to="/rider" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<HomeRedirect />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute role="admin">
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/tracking"
              element={
                <PrivateRoute role="admin">
                  <LiveTracking />
                </PrivateRoute>
              }
            />

            <Route
              path="/rider"
              element={
                <PrivateRoute role="rider">
                  <RiderDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/rider/earnings"
              element={
                <PrivateRoute role="rider">
                  <Earnings />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
