
import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

function UserManagement() {
  const {
    users,
    addUser,
    updateUser,
    deleteUser
  } = useLibrary();

  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [role, setRole] = useState("Member");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function clearForm() {
    setName("");
    setMembershipId("");
    setRole("Member");
    setPassword("");
    setEditingId(null);
    setErrors({});
  }

  function validateForm() {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length > 150) {
      newErrors.name = "Name cannot exceed 150 characters";
    }

    if (!membershipId.trim()) {
      newErrors.membershipId = "Membership ID is required";
    } else if (membershipId.trim().length > 50) {
      newErrors.membershipId = "Membership ID is too long";
    }

    if (editingId === null && !password) {
      newErrors.password = "Password is required";
    } else if (password && password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name: name.trim(),
      membership_id: membershipId.trim(),
      role
    };

    if (password) {
      userData.password = password;
    }

    try {
      setLoading(true);

      if (editingId !== null) {
        await updateUser(editingId, userData);
        alert("User updated successfully!");
      } else {
        await addUser(userData);
        alert("User added successfully!");
      }

      clearForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function editUser(user) {
    setName(user.name);
    setMembershipId(user.membershipId);
    setRole(user.role);
    setPassword("");
    setEditingId(user.id);
    setErrors({});
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) return;

    try {
      await deleteUser(id);
      alert("User deleted successfully!");

      if (editingId === id) {
        clearForm();
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <p>Register and manage library members.</p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          maxLength="150"
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && (
          <p className="login-error">{errors.name}</p>
        )}

        <input
          type="text"
          placeholder="Membership ID"
          value={membershipId}
          maxLength="50"
          onChange={(e) => setMembershipId(e.target.value)}
        />
        {errors.membershipId && (
          <p className="login-error">{errors.membershipId}</p>
        )}

        <input
          type="password"
          placeholder={
            editingId !== null
              ? "New Password (leave blank to keep current)"
              : "Create Password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="login-error">{errors.password}</p>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Member">Member</option>
          <option value="Librarian">Librarian</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading
            ? "Processing..."
            : editingId !== null
              ? "Update User"
              : "Add User"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={clearForm}>
            Cancel
          </button>
        )}
      </form>

      <h2>Registered Users</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.membershipId}</td>
              <td>{user.role}</td>
              <td>
                <button
                  type="button"
                  onClick={() => editUser(user)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan="4">No registered users found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
