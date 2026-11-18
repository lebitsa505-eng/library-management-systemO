
const express = require("express");
const router = express.Router();
const db = require("../db");
const { authorizeRoles } = require("../middleware/authMiddleware");

// Reusable validation function
function validateBook(data) {
    const { title, author, genre, isbn, quantity } = data;

    if (typeof title !== "string" || !title.trim()) {
        return "Book title is required";
    }

    if (title.trim().length > 255) {
        return "Title cannot exceed 255 characters";
    }

    if (typeof author !== "string" || !author.trim()) {
        return "Author name is required";
    }

    if (author.trim().length > 150) {
        return "Author name cannot exceed 150 characters";
    }

    if (typeof genre !== "string" || !genre.trim()) {
        return "Genre is required";
    }

    if (genre.trim().length > 100) {
        return "Genre cannot exceed 100 characters";
    }

    if (
        typeof isbn !== "string" ||
        !/^[A-Za-z0-9 /-]{5,50}$/.test(isbn.trim())
    ) {
        return "Enter a valid ISBN or book identifier";
    }

    if (
        !Number.isSafeInteger(quantity) ||
        quantity < 0 ||
        quantity > 100000
    ) {
        return "Quantity must be a whole number between 0 and 100000";
    }

    return null;
}

// Handle database errors
function handleDatabaseError(err, res) {
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            message: "A book with this ISBN already exists"
        });
    }

    return res.status(500).json({
        message: "A database error occurred"
    });
}

// GET all books
router.get("/", (req, res) => {
    db.query(
        "SELECT * FROM books ORDER BY id DESC",
        (err, results) => {
            if (err) return handleDatabaseError(err, res);
            res.json(results);
        }
    );
});

// GET one book
router.get("/:id", (req, res) => {
    db.query(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return handleDatabaseError(err, res);

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            res.json(results[0]);
        }
    );
});

// ADD a book and record initial stock
router.post("/", authorizeRoles("Admin", "Librarian"), (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;

    const validationError = validateBook(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not start book registration"
            });
        }

        const sql = `
            INSERT INTO books
            (title, author, genre, isbn, quantity, available_quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                title.trim(),
                author.trim(),
                genre.trim(),
                isbn.trim(),
                quantity,
                quantity
            ],
            (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        handleDatabaseError(err, res);
                    });
                }

                const bookId = result.insertId;

                // No addition transaction is needed for zero stock
                if (quantity === 0) {
                    return db.commit((commitError) => {
                        if (commitError) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Could not complete book registration"
                                });
                            });
                        }

                        res.status(201).json({
                            message: "Book added successfully",
                            id: bookId
                        });
                    });
                }

                // Record initial stock as an Addition
                db.query(
                    `INSERT INTO transactions
                    (book_id, member_name, transaction_type, quantity, status)
                    VALUES (?, ?, 'Addition', ?, 'Added')`,
                    [bookId, "Library Inventory", quantity],
                    (err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    message: "Could not record initial book stock"
                                });
                            });
                        }

                        db.commit((commitError) => {
                            if (commitError) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        message: "Could not complete book registration"
                                    });
                                });
                            }

                            res.status(201).json({
                                message: "Book added and initial stock recorded successfully",
                                id: bookId
                            });
                        });
                    }
                );
            }
        );
    });
});

// UPDATE a book
router.put("/:id", authorizeRoles("Admin", "Librarian"), (req, res) => {
    const { title, author, genre, isbn, quantity } = req.body;

    const validationError = validateBook(req.body);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    const sql = `
        UPDATE books
        SET
            title = ?,
            author = ?,
            genre = ?,
            isbn = ?,
            available_quantity = available_quantity + (? - quantity),
            quantity = ?
        WHERE id = ?
        AND available_quantity + (? - quantity) >= 0
    `;

    db.query(
        sql,
        [
            title.trim(),
            author.trim(),
            genre.trim(),
            isbn.trim(),
            quantity,
            quantity,
            req.params.id,
            quantity
        ],
        (err, result) => {
            if (err) return handleDatabaseError(err, res);

            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: "Book not found or new quantity is below the number of borrowed copies"
                });
            }

            res.json({
                message: "Book updated successfully"
            });
        }
    );
});

// DELETE a book
router.delete("/:id", authorizeRoles("Admin", "Librarian"), (req, res) => {
    db.query(
        "DELETE FROM books WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                if (err.code === "ER_ROW_IS_REFERENCED_2") {
                    return res.status(409).json({
                        message: "This book has transaction records and cannot be deleted"
                    });
                }

                return handleDatabaseError(err, res);
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Book not found"
                });
            }

            res.json({
                message: "Book deleted successfully"
            });
        }
    );
});

module.exports = router;
