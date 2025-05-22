// index.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // install with: npm install jsonwebtoken

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const chwRoutes = require('./routes/chw');
app.use('/api/chw', chwRoutes);

// Get all CHWs and their linked CHAs
app.get('/api/chws', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT chw.id, chw.name AS chw_name, cha.name AS cha_name
      FROM chw
      JOIN cha ON chw.cha_id = cha.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all CHUs
app.get('/api/chus', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chu ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CHUs' });
  }
});

// Get all commodities
app.get('/api/commodities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM commodities');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.quantity, r.request_date, r.status,
             ch.name AS chw_name,
             cha.name AS cha_name,
             c.name AS commodity_name
      FROM requests r
      JOIN chw ch ON r.chw_id = ch.id
      JOIN cha ON ch.cha_id = cha.id
      JOIN commodities c ON r.commodity_id = c.id
      ORDER BY r.request_date DESC
      LIMIT 50;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.get('/test', (req, res) => {
  res.send('Hello world');
});


// Submit a request
app.post('/api/requests', async (req, res) => {
  const { chw_id, commodity_id, quantity } = req.body;
  try {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    // Rule 1: Quantity must be a whole number and < 100
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity >= 100) {
      return res.status(400).json({ error: 'Quantity must be a whole number between 1 and 99.' });
    }

    // Rule 2: One request per CHW per commodity per day
    const existingRequest = await pool.query(
      'SELECT id FROM requests WHERE chw_id = $1 AND commodity_id = $2 AND request_date::date = $3',
      [chw_id, commodity_id, today]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ error: 'Only one request per CHW per commodity per day is allowed.' });
    }

    // Rule 3: Monthly limit check (max 200)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString().slice(0, 10);

    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_quantity
       FROM requests
       WHERE chw_id = $1 AND commodity_id = $2 AND request_date >= $3`,
      [chw_id, commodity_id, firstDayStr]
    );

    const monthlyTotal = parseInt(rows[0].total_quantity, 10);
    const monthlyLimit = 200;

    if (monthlyTotal + quantity > monthlyLimit) {
      return res.status(400).json({
        error: `Monthly limit of ${monthlyLimit} exceeded. Current total: ${monthlyTotal}.`
      });
    }

    // Passed all checks: Insert the request
    await pool.query(
      'INSERT INTO requests (chw_id, commodity_id, quantity, request_date, status) VALUES ($1, $2, $3, $4, $5)',
      [chw_id, commodity_id, quantity, now, 'Pending']
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Get pending requests assigned to a CHA (by cha_id)
app.get('/api/cha/:cha_id/requests', async (req, res) => {
  const { cha_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT r.id, r.quantity, r.request_date, r.status,
             chw.name AS chw_name,
             c.name AS commodity_name
      FROM requests r
      JOIN chw ON r.chw_id = chw.id
      JOIN commodities c ON r.commodity_id = c.id
      WHERE chw.cha_id = $1 AND r.status = 'Pending'
      ORDER BY r.request_date DESC
    `, [cha_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch CHA requests' });
  }
});

// Update request status (e.g., to 'Approved' or 'Rejected')
app.post('/api/requests/:id/approve', async (req, res) => {
  const requestId = req.params.id;
  const { action } = req.body; // 'approve' or 'reject'

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected';

    await pool.query(
      'UPDATE requests SET status = $1 WHERE id = $2',
      [newStatus, requestId]
    );

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// CHA Login Route
app.post('/api/cha/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find CHA by email
    const { rows } = await pool.query('SELECT * FROM cha WHERE email = $1', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const cha = rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, cha.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a simple JWT token (optional)
    const token = jwt.sign({ cha_id: cha.id, name: cha.name }, 'your_secret_key', {
      expiresIn: '2h',
    });

    res.json({ message: 'Login successful', token, cha_id: cha.id, name: cha.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});