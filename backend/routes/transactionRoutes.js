
const express = require("express");
const router = express.Router();
const db = require("../db");
const { authorizeRoles } = require("../middleware/authMiddleware");

// Validate transaction input
function validateTransaction(member, bookId) {
    if (typeof member !== "string" || !member.trim()) {
        return "A valid member name is required";
    }

    if (member.trim().length > 150) {
        return "Member name cannot exceed 150 characters";
    }

    if (!Number.isSafeInteger(bookId) || bookId <= 0) {
        return "A valid book must be selected";
    }

    return null;
}

// Roll back failed database transactions
function rollbackTransaction(res, status, message) {
    db.rollback(() => {
        res.status(status).json({ message });
    });
}

// GET transaction history
router.get("/", (req, res) => {
    const sql = `
        SELECT
            transactions.id,
            transactions.member_name AS member,
            books.title AS bookTitle,
            transactions.book_id AS bookId,
            transactions.transaction_type AS type,
            transactions.quantity,
            transactions.transaction_date AS date,
            transactions.status
        FROM transactions
        INNER JOIN books
            ON transactions.book_id = books.id
        ORDER BY transactions.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Could not load transaction history"
            });
        }

        res.json(results);
    });
});

// BORROW A BOOK
router.post("/borrow", authorizeRoles("Admin", "Librarian"), (req, res) => {
    const { member, bookId } = req.body;

    const validationError = validateTransaction(member, bookId);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not start the borrowing process"
            });
        }

        // Lock the selected book
        db.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [bookId],
            (err, books) => {
                if (err) {
                    return rollbackTransaction(
                        res, 500, "Could not retrieve book information"
                    );
                }

                if (books.length === 0) {
                    return rollbackTransaction(
                        res, 404, "Book not found"
                    );
                }

                if (books[0].available_quantity <= 0) {
                    return rollbackTransaction(
                        res, 400, "Sorry, this book is out of stock!"
                    );
                }

                // Reduce available stock
                db.query(
                    `UPDATE books
                     SET available_quantity = available_quantity - 1
                     WHERE id = ?
                     AND available_quantity > 0`,
                    [bookId],
                    (err, updateResult) => {
                        if (err || updateResult.affectedRows === 0) {
                            return rollbackTransaction(
                                res, 500, "Could not update book stock"
                            );
                        }

                        // Record borrowing
                        db.query(
                            `INSERT INTO transactions
                            (book_id, member_name, transaction_type, quantity, status)
                            VALUES (?, ?, 'Borrow', 1, 'Borrowed')`,
                            [bookId, member.trim()],
                            (err, result) => {
                                if (err) {
                                    return rollbackTransaction(
                                        res, 500, "Could not record borrowing"
                                    );
                                }

                                db.commit((err) => {
                                    if (err) {
                                        return rollbackTransaction(
                                            res, 500, "Could not complete borrowing"
                                        );
                                    }

                                    res.status(201).json({
                                        message: "Book borrowed successfully",
                                        id: result.insertId
                                    });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

// RETURN A BOOK
router.post("/return", authorizeRoles("Admin", "Librarian"), (req, res) => {
    const { member, bookId } = req.body;

    const validationError = validateTransaction(member, bookId);

    if (validationError) {
        return res.status(400).json({
            message: validationError
        });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({
                message: "Could not start the return process"
            });
        }

        // Lock the book before changing its stock
        db.query(
            "SELECT * FROM books WHERE id = ? FOR UPDATE",
            [bookId],
            (err, books) => {
                if (err) {
                    return rollbackTransaction(
                        res, 500, "Could not retrieve book information"
                    );
                }

                if (books.length === 0) {
                    return rollbackTransaction(
                        res, 404, "Book not found"
                    );
                }

                // Find an outstanding borrowing record
                db.query(
                    `SELECT * FROM transactions
                     WHERE book_id = ?
                     AND LOWER(member_name) = LOWER(?)
                     AND transaction_type = 'Borrow'
                     AND status = 'Borrowed'
                     ORDER BY id ASC
                     LIMIT 1
                     FOR UPDATE`,
                    [bookId, member.trim()],
                    (err, results) => {
                        if (err) {
                            return rollbackTransaction(
                                res, 500, "Could not find borrowing record"
                            );
                        }

                        if (results.length === 0) {
                            return rollbackTransaction(
                                res, 400,
                                "This member has not borrowed this book!"
                            );
                        }

                        // Increase available stock
                        db.query(
                            `UPDATE books
                             SET available_quantity = available_quantity + 1
                             WHERE id = ?
                             AND available_quantity < quantity`,
                            [bookId],
                            (err, updateResult) => {
                                if (err || updateResult.affectedRows === 0) {
                                    return rollbackTransaction(
                                        res, 400,
                                        "Could not update available book stock"
                                    );
                                }

                                // Mark original borrowing as returned
                                db.query(
                                    `UPDATE transactions
                                     SET status = 'Returned'
                                     WHERE id = ?`,
                                    [results[0].id],
                                    (err) => {
                                        if (err) {
                                            return rollbackTransaction(
                                                res, 500,
                                                "Could not update borrowing record"
                                            );
                                        }

                                        // Record the return transaction
                                        db.query(
                                            `INSERT INTO transactions
                                            (book_id, member_name, transaction_type, quantity, status)
                                            VALUES (?, ?, 'Return', 1, 'Returned')`,
                                            [bookId, member.trim()],
                                            (err, result) => {
                                                if (err) {
                                                    return rollbackTransaction(
                                                        res, 500,
                                                        "Could not record book return"
                                                    );
                                                }

                                                db.commit((err) => {
                                                    if (err) {
                                                        return rollbackTransaction(
                                                            res, 500,
                                                            "Could not complete book return"
                                                        );
                                                    }

                                                    res.status(201).json({
                                                        message: "Book returned successfully",
                                                        id: result.insertId
                                                    });
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});

module.exports = router;
