
import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

function BookManagement() {
  const { books, addBook, updateBook, deleteBook } = useLibrary();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validateForm() {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Book title is required";
    } else if (title.trim().length > 255) {
      newErrors.title = "Title cannot exceed 255 characters";
    }

    if (!author.trim()) {
      newErrors.author = "Author name is required";
    } else if (author.trim().length > 150) {
      newErrors.author = "Author name is too long";
    }

    if (!genre.trim()) {
      newErrors.genre = "Genre is required";
    } else if (genre.trim().length > 100) {
      newErrors.genre = "Genre cannot exceed 100 characters";
    }

    if (!isbn.trim()) {
      newErrors.isbn = "ISBN is required";
    } else if (
      !/^[A-Za-z0-9 /-]{5,50}$/.test(isbn.trim())
    ) {
      newErrors.isbn = "Enter a valid ISBN or book identifier";
    }

    const bookQuantity = Number(quantity);

    if (quantity === "") {
      newErrors.quantity = "Quantity is required";
    } else if (
      !Number.isSafeInteger(bookQuantity) ||
      bookQuantity < 0 ||
      bookQuantity > 100000
    ) {
      newErrors.quantity =
        "Quantity must be a whole number between 0 and 100000";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      quantity: Number(quantity)
    };

    try {
      setLoading(true);

      if (editingId !== null) {
        await updateBook(editingId, bookData);
        alert("Book updated successfully!");
      } else {
        await addBook(bookData);
        alert("Book added successfully!");
      }

      clearForm();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function editBook(book) {
    setTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre || "");
    setIsbn(book.isbn || "");
    setQuantity(String(book.quantity));
    setEditingId(book.id);
    setErrors({});
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );

    if (!confirmed) return;

    try {
      await deleteBook(id);
      alert("Book deleted successfully!");

      if (editingId === id) {
        cancelEdit();
      }
    } catch (error) {
      alert(error.message);
    }
  }

  function clearForm() {
    setTitle("");
    setAuthor("");
    setGenre("");
    setIsbn("");
    setQuantity("");
    setEditingId(null);
    setErrors({});
  }

  function cancelEdit() {
    clearForm();
  }

  return (
    <div className="book-management">
      <h1>Book Management</h1>
      <p>Add and manage library books.</p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          maxLength="255"
          onChange={(e) => setTitle(e.target.value)}
        />
        {errors.title && <p className="login-error">{errors.title}</p>}

        <input
          type="text"
          placeholder="Author"
          value={author}
          maxLength="150"
          onChange={(e) => setAuthor(e.target.value)}
        />
        {errors.author && <p className="login-error">{errors.author}</p>}

        <input
          type="text"
          placeholder="Genre"
          value={genre}
          maxLength="100"
          onChange={(e) => setGenre(e.target.value)}
        />
        {errors.genre && <p className="login-error">{errors.genre}</p>}

        <input
          type="text"
          placeholder="ISBN"
          value={isbn}
          maxLength="50"
          onChange={(e) => setIsbn(e.target.value)}
        />
        {errors.isbn && <p className="login-error">{errors.isbn}</p>}

        <input
          type="number"
          min="0"
          max="100000"
          step="1"
          placeholder="Initial Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {errors.quantity && (
          <p className="login-error">{errors.quantity}</p>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : editingId !== null
              ? "Update Book"
              : "Add Book"}
        </button>

        {editingId !== null && (
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <h2>Books List</h2>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
              <td>{book.isbn}</td>
              <td>{book.quantity}</td>
              <td>
                <button
                  type="button"
                  onClick={() => editBook(book)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(book.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {books.length === 0 && (
            <tr>
              <td colSpan="6">No books found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BookManagement;
