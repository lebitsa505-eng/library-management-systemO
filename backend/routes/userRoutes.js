
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const { authorizeRoles } = require("../middleware/authMiddleware");

// GET all users (never expose password hashes)
router.get("/", (req, res) => {
    const sql = `
        SELECT id, name, membership_id, role, created_at
        FROM users
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Could not load users" });
        }

        res.json(results);
    });
});

// ADD a user with a securely hashed password
router.post("/", authorizeRoles("Admin"), async (req, res) => {
    const { name, membership_id, role, password } = req.body;

    if (!name?.trim() || !membership_id?.trim() || !role || !password) {
        return res.status(400).json({
            message: "Name, membership ID, role and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    const allowedRoles = ["Admin", "Librarian", "Member"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid user role" });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 12);

        const sql = `
            INSERT INTO users (name, membership_id, role, password_hash)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name.trim(), membership_id.trim(), role, passwordHash],
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Membership ID already exists"
                        });
                    }

                    return res.status(500).json({
                        message: "Could not add user"
                    });
                }

                res.status(201).json({
                    message: "User added successfully",
                    id: result.insertId
                });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Password processing failed" });
    }
});

// UPDATE user details and optionally change password
router.put("/:id", authorizeRoles("Admin"), async (req, res) => {
    const { name, membership_id, role, password } = req.body;

    if (!name?.trim() || !membership_id?.trim() || !role) {
        return res.status(400).json({
            message: "Name, membership ID and role are required"
        });
    }

    const allowedRoles = ["Admin", "Librarian", "Member"];

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid user role" });
    }

    if (password && password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    try {
        let sql;
        let values;

        if (password) {
            const passwordHash = await bcrypt.hash(password, 12);

            sql = `
                UPDATE users
                SET name = ?, membership_id = ?, role = ?, password_hash = ?
                WHERE id = ?
            `;

            values = [
                name.trim(),
                membership_id.trim(),
                role,
                passwordHash,
                req.params.id
            ];
        } else {
            sql = `
                UPDATE users
                SET name = ?, membership_id = ?, role = ?
                WHERE id = ?
            `;

            values = [
                name.trim(),
                membership_id.trim(),
                role,
                req.params.id
            ];
        }

        db.query(sql, values, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Membership ID already exists"
                    });
                }

                return res.status(500).json({
                    message: "Could not update user"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "User updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Password processing failed" });
    }
});

// DELETE a user
router.delete("/:id", authorizeRoles("Admin"), (req, res) => {
    const sql = "DELETE FROM users WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Could not delete user"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
