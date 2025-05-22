import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

function CHALogin() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5050/api/cha/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        login({ cha_id: data.cha_id, token: data.token, name: data.name });
      }
    } catch (err) {
      setError('Server error, try again later');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.heading}>CHA Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Email:
          <input
            style={styles.input}
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email"
            required
          />
        </label>

        <label style={styles.label}>
          Password:
          <input
            style={styles.input}
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Enter your password"
            required
          />
        </label>

        <button type="submit" style={styles.button}>Log In</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f4f4f4',
    padding: '2rem',
  },
  form: {
    background: '#ffffff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#333',
  },
  label: {
    display: 'block',
    marginBottom: '1rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginTop: '0.4rem',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.9rem',
    marginTop: '1.5rem',
    background: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    color: '#e74c3c',
    marginBottom: '1rem',
    textAlign: 'center',
    fontWeight: '500',
  },
};

export default CHALogin;
