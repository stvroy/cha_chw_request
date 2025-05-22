import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CHWSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    chu_id: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [chus, setChus] = useState([]);

  useEffect(() => {
    async function fetchChus() {
      try {
        const res = await fetch('http://localhost:5050/api/chus');
        const data = await res.json();
        setChus(data);
      } catch (err) {
        console.error('Failed to load CHUs', err);
      }
    }
    fetchChus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('http://localhost:5050/api/chw/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setMessage(data.message || 'Signup successful!');
      setFormData({ name: '', email: '', password: '', chu_id: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2>CHW Registration</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <label htmlFor="chu_id">Select Community Health Unit (CHU):</label>
        <select
          name="chu_id"
          value={formData.chu_id}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">-- Select a CHU --</option>
          {chus.map((chu) => (
            <option key={chu.id} value={chu.id}>
              {chu.name} ({chu.county})
            </option>
          ))}
        </select>

        <button type="submit" style={styles.button}>Register</button>

        {message && (
          <div>
            <p style={{ color: 'green' }}>{message}</p>
            <Link to="/request" style={styles.link}>
              Go to CHW Request Form →
            </Link>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '0 auto',
    padding: '2rem',
    border: '1px solid #eee',
    borderRadius: 8,
    background: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: 4,
  },
  button: {
    padding: '0.75rem',
    background: '#4CAF50',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  link: {
    marginTop: '1rem',
    display: 'inline-block',
    color: '#007BFF',
    textDecoration: 'underline',
    fontWeight: '500',
  },
};

export default CHWSignup;