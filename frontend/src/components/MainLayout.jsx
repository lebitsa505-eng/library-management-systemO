
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function MainLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    sessionStorage.removeItem("bookwiseToken");
    sessionStorage.removeItem("bookwiseUser");

    navigate("/login", { replace: true });
  }

  const storedUser = sessionStorage.getItem("bookwiseUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="top-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search books, members..."
            />
          </div>

          <div className="header-profile">
            <span className="notification">🔔</span>

            <div className="profile-info">
              <strong>{user?.name || "Librarian"}</strong>
              <small>{user?.role || "Administrator"}</small>
            </div>

            <div className="profile-avatar">
              {(user?.name || "L").charAt(0).toUpperCase()}
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
