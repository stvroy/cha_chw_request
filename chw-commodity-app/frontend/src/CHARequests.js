import React, { useEffect, useState, useContext } from 'react';
import { fetchPendingRequests, approveRequest, rejectRequest } from './api/api';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';

function exportToCSV(data, filename = 'requests.csv') {
  const headers = ['Date', 'CHW', 'Commodity', 'Quantity'];
  const rows = data.map(r => [
    new Date(r.request_date).toLocaleString(),
    r.chw_name,
    r.commodity_name,
    r.quantity
  ]);
  const csvContent = [headers, ...rows]
    .map(row => row.map(String).map(val => `"${val}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function CHARequests() {
  const { chaId, token, logout, name } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!chaId) {
      setMessage('Please login first');
      setLoading(false);
      return;
    }
    async function loadPending() {
      try {
        setLoading(true);
        const data = await fetchPendingRequests(chaId);
        setRequests(data);
      } catch (error) {
        setMessage('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    }
    loadPending();
  }, [chaId, token]);

  const handleApprove = async (id) => {
    try {
      const res = await approveRequest(id);
      if (res.error) {
        setMessage(`Error: ${res.error}`);
      } else {
        setMessage('✅ Request approved.');
        setRequests(requests.filter(r => r.id !== id));
      }
    } catch {
      setMessage('Approval failed.');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await rejectRequest(id);
      if (res.error) {
        setMessage(`Error: ${res.error}`);
      } else {
        setMessage('❌ Request rejected.');
        setRequests(requests.filter(r => r.id !== id));
      }
    } catch {
      setMessage('Rejection failed.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <p style={{ padding: 20 }}>Loading requests...</p>;
  if (!chaId) return <p style={{ padding: 20 }}>Please log in to view your requests.</p>;

  const filteredRequests = requests.filter(r =>
    r.chw_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.commodity_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{
      maxWidth: 900,
      margin: '40px auto',
      padding: 30,
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      color: darkMode ? '#f7fafc' : '#1a202c',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 12,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>CHA Dashboard</h1>
        <div>
          <button onClick={toggleTheme} style={{ marginRight: 10 }}>
            {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={handleLogout}
            style={{
              padding: '6px 14px',
              backgroundColor: '#e53e3e',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}>
            Logout
          </button>
        </div>
      </div>

      <p>Welcome, {name}!</p>

      <input
        type="text"
        placeholder="Search CHW or commodity..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          padding: 8,
          width: '100%',
          margin: '20px 0',
          borderRadius: 6,
          border: '1px solid #ccc'
        }}
      />

      {filteredRequests.length > 0 && (
        <button
          onClick={() => exportToCSV(filteredRequests)}
          style={{
            padding: '6px 12px',
            marginBottom: 16,
            backgroundColor: '#38a169',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          ⬇️ Export to CSV
        </button>
      )}

      {message && <p>{message}</p>}

      {filteredRequests.length === 0 ? (
        <p>No matching requests found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: darkMode ? '#4a5568' : '#edf2f7' }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>CHW</th>
              <th style={thStyle}>Commodity</th>
              <th style={thStyle}>Quantity</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map(r => (
              <tr key={r.id}>
                <td style={tdStyle}>{new Date(r.request_date).toLocaleString()}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: '#3182ce',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                      fontWeight: 'bold'
                    }}>
                      {r.chw_name.split(' ').map(w => w[0]).join('').toUpperCase()}
                    </div>
                    {r.chw_name}
                  </div>
                </td>
                <td style={tdStyle}>{r.commodity_name}</td>
                <td style={tdStyle}>{r.quantity}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleApprove(r.id)} style={approveBtn}>Approve</button>
                  <button onClick={() => handleReject(r.id)} style={rejectBtn}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          style={{ marginRight: 10 }}
        >
          ⬅️ Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{ marginLeft: 10 }}
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
}

// Reusable styles
const thStyle = {
  textAlign: 'left',
  padding: '10px',
  fontWeight: '600',
  fontSize: '14px'
};

const tdStyle = {
  padding: '10px',
  fontSize: '14px'
};

const approveBtn = {
  padding: '5px 10px',
  backgroundColor: '#3182ce',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  marginRight: 6
};

const rejectBtn = {
  padding: '5px 10px',
  backgroundColor: '#e53e3e',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

export default CHARequests;