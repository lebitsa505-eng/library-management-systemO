
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const LibraryContext = createContext();

const BOOKS_API = "http://localhost:5000/api/books";
const TRANSACTIONS_API = "http://localhost:5000/api/transactions";
const USERS_API = "http://localhost:5000/api/users";

// Automatically attach the login token
function getHeaders(json = false) {
  const token = sessionStorage.getItem("bookwiseToken");

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Format book data from MySQL
function formatBook(book) {
  return {
    ...book,
    quantity: Number(book.quantity),
    availableQuantity: Number(book.available_quantity)
  };
}

// Format user data from MySQL
function formatUser(user) {
  return {
    ...user,
    membershipId: user.membership_id
  };
}

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);

  // LOAD LIBRARY DATA
  async function refreshLibrary() {
    const headers = getHeaders();

    const [bookRes, transactionRes, userRes] = await Promise.all([
      fetch(BOOKS_API, { headers }),
      fetch(TRANSACTIONS_API, { headers }),
      fetch(USERS_API, { headers })
    ]);

    if ([bookRes, transactionRes, userRes].some(res => res.status === 401)) {
      sessionStorage.removeItem("bookwiseToken");
      sessionStorage.removeItem("bookwiseUser");
      window.location.href = "/login";
      throw new Error("Your login session has expired. Please log in again.");
    }

    if (!bookRes.ok || !transactionRes.ok || !userRes.ok) {
      throw new Error("Failed to load library data");
    }

    const bookData = await bookRes.json();
    const transactionData = await transactionRes.json();
    const userData = await userRes.json();

    setBooks(bookData.map(formatBook));
    setTransactions(transactionData);
    setUsers(userData.map(formatUser));
  }

  useEffect(() => {
    if (sessionStorage.getItem("bookwiseToken")) {
      refreshLibrary().catch(console.error);
    }
  }, []);

  // BOOK MANAGEMENT

  async function addBook(book) {
    const response = await fetch(BOOKS_API, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(book)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not add book");
    }

    await refreshLibrary();
  }

  async function updateBook(id, book) {
    const response = await fetch(`${BOOKS_API}/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(book)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update book");
    }

    await refreshLibrary();
  }

  async function deleteBook(id) {
    const response = await fetch(`${BOOKS_API}/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not delete book");
    }

    await refreshLibrary();
  }

  // TRANSACTION MANAGEMENT

  async function recordTransaction(member, bookId, type) {
    const endpoint = type === "Borrow" ? "borrow" : "return";

    const response = await fetch(`${TRANSACTIONS_API}/${endpoint}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ member, bookId })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Transaction failed");
    }

    await refreshLibrary();

    return data;
  }

  // USER MANAGEMENT

  async function addUser(user) {
    const response = await fetch(USERS_API, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({
        name: user.name,
        membership_id: user.membership_id,
        role: user.role,
        password: user.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not add user");
    }

    await refreshLibrary();
  }

  async function updateUser(id, user) {
    const response = await fetch(`${USERS_API}/${id}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({
        name: user.name,
        membership_id: user.membership_id,
        role: user.role,
        password: user.password || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not update user");
    }

    await refreshLibrary();
  }

  async function deleteUser(id) {
    const response = await fetch(`${USERS_API}/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not delete user");
    }

    await refreshLibrary();
  }

  return (
    <LibraryContext.Provider
      value={{
        books,
        setBooks,
        transactions,
        setTransactions,
        users,
        setUsers,
        refreshLibrary,
        addBook,
        updateBook,
        deleteBook,
        recordTransaction,
        addUser,
        updateUser,
        deleteUser
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
