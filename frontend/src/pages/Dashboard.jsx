
import { useLibrary } from "../context/LibraryContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const { books, transactions, users } = useLibrary();

  // Calculate library statistics
  const totalBooks = books.reduce(
    (total, book) => total + Number(book.quantity || 0),
    0
  );

  const availableBooks = books.reduce(
    (total, book) => total + Number(book.availableQuantity || 0),
    0
  );

  const borrowedBooks = totalBooks - availableBooks;

  // Identify books with fewer than 2 available copies
  const lowStockBooks = books.filter(
    (book) => Number(book.availableQuantity) < 2
  );

  // Show the latest 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="dashboard">

      {/* Dashboard heading */}
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Librarian!</p>
        </div>

        <button
          className="add-book-btn"
          onClick={() => navigate("/books")}
        >
          + Add New Book
        </button>
      </div>

      {/* Statistics cards */}
      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Books</h3>
          <h2>{totalBooks}</h2>
          <p>Books in the library</p>
        </div>

        <div className="stat-card">
          <h3>Available Books</h3>
          <h2>{availableBooks}</h2>
          <p>Ready for borrowing</p>
        </div>

        <div className="stat-card">
          <h3>Borrowed Books</h3>
          <h2>{borrowedBooks}</h2>
          <p>Currently borrowed</p>
        </div>

        <div className="stat-card">
          <h3>Registered Users</h3>
          <h2>{users.length}</h2>
          <p>Library members</p>
        </div>

      </div>

      {/* Low stock alerts */}
      <div className="dashboard-section">
        <h2>Low Stock Alerts</h2>

        {lowStockBooks.length === 0 ? (
          <p>All books have sufficient stock.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Author</th>
                <th>Available Copies</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {lowStockBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.availableQuantity}</td>
                  <td>Low Stock</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent transaction activity */}
      <div className="dashboard-section">
        <h2>Recent Activity</h2>

        {recentTransactions.length === 0 ? (
          <p>No recent transactions available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Transaction Type</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.member}</td>
                  <td>{transaction.bookTitle}</td>
                  <td>{transaction.type}</td>
                  <td>{transaction.quantity}</td>
                  <td>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td>{transaction.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="add-book-btn"
          onClick={() => navigate("/transactions")}
        >
          View All Transactions
        </button>
      </div>

    </div>
  );
}

export default Dashboard;
