// routes/chw.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// CHW Signup
// router.post('/signup', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const existing = await pool.query('SELECT * FROM chw WHERE email = $1', [email]);
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ error: 'Email already registered' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     await pool.query(
//       `INSERT INTO chw (name, email, password_hash, approved) VALUES ($1, $2, $3, false)`,
//       [name, email, hashedPassword]
//     );

//     res.status(201).json({ message: 'Signup successful. Awaiting admin approval.' });
//   } catch (err) {
//     console.error('Signup Error:', err); // <-- add this line
//     res.status(500).json({ error: 'Signup failed. Please try again.' });
//   }
// });

// CHW Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, chu_id } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM chw WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔍 Get one CHA from the selected CHU
    const chaResult = await pool.query(
      'SELECT id FROM cha WHERE chu_id = $1 LIMIT 1',
      [chu_id]
    );
    const cha_id = chaResult.rows[0]?.id || null;

    // ✅ Insert new CHW
    await pool.query(
      `INSERT INTO chw (name, email, password_hash, chu_id, cha_id, approved, rejected)
       VALUES ($1, $2, $3, $4, $5, false, false)`,
      [name, email, hashedPassword, chu_id, cha_id]
    );

    // ✅ Updated message
    res.status(201).json({
      message: 'You have been registered! Please click the link to request the commodities immediately!',
    });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});


// CHW Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM chw WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const chw = result.rows[0];

    if (!chw.approved) {
      return res.status(403).json({ error: 'Account not approved by admin yet' });
    }

    const passwordMatch = await bcrypt.compare(password, chw.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ If successful, return CHW details (or token if needed later)
    res.json({ message: 'Login successful', chw: { id: chw.id, name: chw.name, email: chw.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Update CHW approval status
router.post('/:chwId/approve', async (req, res) => {
  const { chwId } = req.params;
  const { approve } = req.body;  // boolean: true = approve, false = reject

  try {
    await pool.query(
      'UPDATE chw SET approved = $1, rejected = $2 WHERE id = $3',
      [approve, !approve, chwId]
    );
    res.json({ success: true, message: `CHW ${approve ? 'approved' : 'rejected'}` });
  } catch (err) {
    console.error('Error updating CHW approval:', err);
    res.status(500).json({ error: 'Failed to update approval status' });
  }
});

// Get all CHWs (for admin approval interface)
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, approved FROM chw ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch CHWs:', err);
    res.status(500).json({ error: 'Failed to fetch CHWs' });
  }
});

// Get approved CHWs (for request form dropdown)
router.get('/approved', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email FROM chw WHERE approved = true ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch approved CHWs:', err);
    res.status(500).json({ error: 'Failed to fetch approved CHWs' });
  }
});

module.exports = router;