import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import {
  fetchCHWs,
  fetchCommodities,
  submitRequest,
  fetchRequests
} from './api/api';

function CHWRequestForm() {
  const [chws, setChws] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedChw, setSelectedChw] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cha, setCha] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const chwsData = await fetchCHWs();
        const approvedChws = chwsData.filter(chw => chw.approved); // ✅ Filter approved CHWs
        setChws(chwsData);

        const commoditiesData = await fetchCommodities();
        setCommodities(commoditiesData);

        const requestsData = await fetchRequests();
        setRequests(requestsData);
      } catch (error) {
        setMessage('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const chw = chws.find(c => c.id === Number(selectedChw));
    setCha(chw ? chw.cha_name : '');
  }, [selectedChw, chws]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (!selectedChw) return setMessage('Select a CHW');
    if (!selectedCommodity) return setMessage('Select a commodity');
    if (!Number.isInteger(qtyNum) || qtyNum <= 0 || qtyNum >= 100) {
      return setMessage('Quantity must be a whole number between 1 and 99');
    }
    try {
      const res = await submitRequest({
        chw_id: Number(selectedChw),
        commodity_id: Number(selectedCommodity),
        quantity: qtyNum
      });
      if (res.error) {
        setMessage(`Error: ${res.error}`);
      } else {
        setMessage('Request submitted successfully!');
        setQuantity('');
        setSelectedCommodity('');
        setSelectedChw('');
        setCha('');
        const requestsData = await fetchRequests();
        setRequests(requestsData);
      }
    } catch (error) {
      setMessage('Submission failed. Please try again.');
    }
  };

  const summaryByCommodity = commodities.map(c => {
    const total = requests
      .filter(r => r.commodity_name.toLowerCase() === c.name.toLowerCase())
      .reduce((sum, r) => sum + r.quantity, 0);
    return { name: c.name, total };
  });

  if (loading) return <p style={styles.loading}>Loading data, please wait...</p>;

  const exportToCSV = () => {
    const headers = ['Date', 'CHW', 'CHA', 'Commodity', 'Quantity', 'Status'];
    const filtered = requests.filter(r => {
      const term = searchTerm.toLowerCase();
      return (
        r.chw_name.toLowerCase().includes(term) ||
        r.cha_name.toLowerCase().includes(term) ||
        r.commodity_name.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
      );
    });

    const rows = filtered.map(r => [
      new Date(r.request_date).toLocaleString(),
      r.chw_name,
      r.cha_name,
      r.commodity_name,
      r.quantity,
      r.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(item => `"${String(item).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'chw_requests.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container} className="card">
      <h1 style={styles.title}>CHW Commodity Request Form</h1>
      <button onClick={toggleTheme} style={styles.button}>
        {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Select CHW:
          <select
            value={selectedChw}
            onChange={e => {
              setSelectedChw(e.target.value);
              setMessage('');
            }}
            style={styles.select}
          >
            <option value="">-- Select CHW --</option>
            {chws.map(chw => (
              <option key={chw.id} value={chw.id}>{chw.chw_name}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          CHA (auto-selected):
          <input
            type="text"
            value={cha}
            readOnly
            style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
          />
        </label>

        <label style={styles.label}>
          Select Commodity:
          <select
            value={selectedCommodity}
            onChange={e => {
              setSelectedCommodity(e.target.value);
              setMessage('');
            }}
            style={styles.select}
          >
            <option value="">-- Select Commodity --</option>
            {commodities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Quantity:
          <input
            type="number"
            value={quantity}
            onChange={e => {
              setQuantity(e.target.value);
              setMessage('');
            }}
            min="1"
            max="99"
            style={styles.input}
          />
        </label>

        <button type="submit" style={styles.button}>Submit Request</button>
      </form>

      {message && (
        <p style={message.startsWith('Request submitted') ? styles.successMessage : styles.errorMessage}>
          {message.startsWith('Request submitted') ? '✅ ' : '❌ '}
          {message}
        </p>
      )}

      <hr style={styles.hr} />

      <h2 style={styles.subtitle}>Request Log</h2>
      <input
        type="text"
        placeholder="Search CHW, CHA, Commodity or Status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />
      <button onClick={exportToCSV} style={styles.exportButton}>
        ⬇️ Export to CSV
      </button>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>CHW</th>
            <th style={styles.th}>CHA</th>
            <th style={styles.th}>Commodity</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.filter(r => {
            const term = searchTerm.toLowerCase();
            return (
              r.chw_name.toLowerCase().includes(term) ||
              r.cha_name.toLowerCase().includes(term) ||
              r.commodity_name.toLowerCase().includes(term) ||
              r.status.toLowerCase().includes(term)
            );
          }).map(r => (
            <tr key={r.id} style={r.status.toLowerCase() === 'approved' ? styles.approvedRow : {}}>
              <td style={styles.td}>{new Date(r.request_date).toLocaleString()}</td>
              <td style={styles.td}>{r.chw_name}</td>
              <td style={styles.td}>{r.cha_name}</td>
              <td style={styles.td}>{r.commodity_name}</td>
              <td style={styles.td}>{r.quantity}</td>
              <td style={{ ...styles.td, ...statusStyles[r.status?.toLowerCase()] }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={styles.subtitle}>Dashboard Summary</h2>
      <ul>
        {summaryByCommodity.map(item => (
          <li key={item.name} style={styles.summaryItem}>
            {item.name}: <strong>{item.total}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

const statusStyles = {
  approved: { color: 'green', fontWeight: 'bold' },
  pending: { color: 'orange', fontWeight: 'bold' },
  rejected: { color: 'red', fontWeight: 'bold' }
};

const styles = {
  container: {
    maxWidth: 900,
    margin: '20px auto',
    padding: 20,
    borderRadius: 8,
    fontFamily: 'Segoe UI, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#005A9C'
  },
  form: {
    display: 'grid',
    gap: '15px',
    marginBottom: 30,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
  select: {
    marginTop: 6,
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  input: {
    marginTop: 6,
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
  },
  button: {
    padding: '12px 20px',
    fontSize: 16,
    backgroundColor: '#0078D4',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    fontWeight: '600',
  },
  successMessage: {
    marginTop: 20,
    fontWeight: '600',
    color: 'green',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 20,
    fontWeight: '600',
    color: '#b00020',
    textAlign: 'center',
  },
  hr: {
    margin: '40px 0',
    borderColor: '#eee',
  },
  subtitle: {
    marginBottom: 20,
    borderBottom: '2px solid #0078D4',
    paddingBottom: 6,
    color: '#004578',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 30,
  },
  th: {
    borderBottom: '2px solid #0078D4',
    padding: 10,
    textAlign: 'left',
    backgroundColor: '#f3f9ff',
    color: '#005A9C',
    fontWeight: '700',
  },
  td: {
    padding: 10,
    borderBottom: '1px solid #ddd',
  },
  approvedRow: {
    backgroundColor: '#e6f4ea',
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
    color: '#555',
  },
  summaryItem: {
    fontSize: 16,
    marginBottom: 6,
  },
  searchInput: {
    padding: 10,
    width: '100%',
    marginBottom: 20,
    fontSize: 14,
    borderRadius: 5,
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  exportButton: {
    padding: 10,
    backgroundColor: '#0078D4',
    color: '#fff',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: 20,
  }
};

export default CHWRequestForm;