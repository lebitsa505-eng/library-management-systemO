
import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

function Transactions() {
  const {
    books,
    transactions,
    recordTransaction
  } = useLibrary();

  const [member, setMember] = useState("");
  const [book, setBook] = useState("");
  const [type, setType] = useState("Borrow");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!member.trim() || !book) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const result = await recordTransaction(
        member.trim(),
        Number(book),
        type
      );

      alert(result.message);

      setMember("");
      setBook("");
      setType("Borrow");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transactions">
      <h1>Transactions Management</h1>
      <p>Manage book borrowing and returns.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Member Name"
          value={member}
          onChange={(e) => setMember(e.target.value)}
        />

        <select
          value={book}
          onChange={(e) => setBook(e.target.value)}
        >
          <option value="">Select a Book</option>

          {books.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title} — Available: {item.availableQuantity}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Borrow">Borrow Book</option>
          <option value="Return">Return Book</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Record Transaction"}
        </button>
      </form>

      <h2>Transaction History</h2>

      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Book Title</th>
            <th>Type</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.member}</td>
             <td>{transaction.bookTitle}</td>
              <td>{transaction.type}</td>
              <td>
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td>{transaction.status}</td>
            </tr>
          ))}

          {transactions.length === 0 && (
            <tr>
              <td colSpan="5">No transactions recorded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;
