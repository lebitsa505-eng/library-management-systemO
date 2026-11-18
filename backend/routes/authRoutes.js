
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// USER LOGIN
router.post("/login", (req, res) => {
    const { membership_id, password } = req.body;

    if (!membership_id?.trim() || !password) {
        return res.status(400).json({
            message: "Membership ID and password are required"
        });
    }

    const sql = `
        SELECT id, name, membership_id, role, password_hash
        FROM users
        WHERE membership_id = ?
        LIMIT 1
    `;

    db.query(sql, [membership_id.trim()], async (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Login service temporarily unavailable"
            });
        }

        if (results.length === 0 || !results[0].password_hash) {
            return res.status(401).json({
                message: "Invalid membership ID or password"
            });
        }

        const user = results[0];

        try {
            const passwordMatches = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    message: "Invalid membership ID or password"
                });
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
                }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    membershipId: user.membership_id,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({
                message: "Could not complete login"
            });
        }
    });
});

module.exports = router;
