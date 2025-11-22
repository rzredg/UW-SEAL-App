import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const userExists = await pool.query(
      "SELECT email FROM members WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO members (full_name, email, password, role)
       VALUES ($1, $2, $3, 'Associate')
       RETURNING member_id, full_name, email`,
      [full_name, email, hashed]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT member_id, full_name, email, password FROM members WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.member_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.member_id,
        name: user.full_name,
        email: user.email,
      }
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};