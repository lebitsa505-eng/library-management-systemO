
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const bookRoutes = require("./routes/bookRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const {
    verifyToken,
    authorizeRoles
} = require("./middleware/authMiddleware");

require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Public health check
app.get("/", (req, res) => {
    res.send("BookWise Backend is running!");
});

// Protected routes
app.use("/api/books", verifyToken, bookRoutes);
app.use("/api/transactions", verifyToken, transactionRoutes);
app.use("/api/users", verifyToken, userRoutes);

// Login remains public
app.use("/api/auth", authRoutes);

// Login remains public
app.use("/api/auth", authRoutes);

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`BookWise server running on port ${PORT}`);
});
