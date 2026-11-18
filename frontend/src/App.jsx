
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./components/MainLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookManagement from "./pages/BookManagement";
import Transactions from "./pages/Transactions";
import UserManagement from "./pages/UserManagement";

// Protect pages that require authentication
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("bookwiseToken");

  return token ? children : <Navigate to="/login" replace />;
}

// Protect pages according to user role
function RoleRoute({ children, allowedRoles }) {
  const storedUser = sessionStorage.getItem("bookwiseUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public login page */}
      <Route path="/login" element={<Login />} />

      {/* Protected application pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="books" element={<BookManagement />} />

        <Route
          path="transactions"
          element={
            <RoleRoute allowedRoles={["Admin", "Librarian"]}>
              <Transactions />
            </RoleRoute>
          }
        />

        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={["Admin"]}>
              <UserManagement />
            </RoleRoute>
          }
        />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
