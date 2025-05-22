require('dotenv').config(); // load .env variables
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function resetPassword(email, newPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const res = await pool.query(
      'UPDATE cha SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    if (res.rowCount === 0) {
      console.log(`No CHA user found with email: ${email}`);
    } else {
      console.log(`Password successfully reset for ${email}`);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

// Replace these with the actual CHA email and the new password you want to set
const chaEmail = 'mary.cha@example.com';
const newPassword = 'NewStrongPassword123!';

resetPassword(chaEmail, newPassword);