
import { NavLink } from "react-router-dom";

function Sidebar() {
  const storedUser = sessionStorage.getItem("bookwiseUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>BookWise</h2>
        <p>Library Management</p>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-heading">MAIN MENU</p>

        <NavLink to="/" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/books" className="nav-link">
          Book Management
        </NavLink>

        {(role === "Admin" || role === "Librarian") && (
          <NavLink to="/transactions" className="nav-link">
            Transactions
          </NavLink>
        )}

        {role === "Admin" && (
          <NavLink to="/users" className="nav-link">
            User Management
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <p>BookWise © 2026</p>
      </div>
    </aside>
  );
}

export default Sidebar;
