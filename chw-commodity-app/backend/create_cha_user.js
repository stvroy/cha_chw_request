const bcrypt = require('bcrypt');
const pool = require('./db');

async function createCHA(email, password, name) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO cha (email, password_hash, name) VALUES ($1, $2, $3)',
      [email, hashedPassword, name]
    );

    console.log(`CHA user ${email} created successfully.`);
  } catch (error) {
    console.error('Error creating CHA:', error);
  } finally {
    process.exit();
  }
}

// Example usage:
createCHA('cha_user@example.com', 'mypassword123', 'CHA John Doe');