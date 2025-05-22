import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminCHWApproval() {
  const [chws, setChws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCHWs = async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/chw/list');
      setChws(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load CHWs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCHWs();
  }, []);

  const updateApproval = async (chwId, approve) => {
    try {
      await axios.post(`http://localhost:5050/api/chw/${chwId}/approve`, { approve });
      // Update UI locally after success
      setChws(prev =>
        prev.map(chw =>
          chw.id === chwId ? { ...chw, approved: approve } : chw
        )
      );
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  if (loading) return <p>Loading CHWs...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>CHW Signup Approval</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Approved?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chws.map(chw => (
            <tr key={chw.id}>
              <td>{chw.name}</td>
              <td>{chw.email}</td>
              <td>{chw.approved ? 'Yes' : 'No'}</td>
              <td>
                {chw.is_approved ? (
                 <>
                  <em>Approved</em>{' '}
                  <button onClick={() => updateApproval(chw.id, false)}>Revoke Approval</button>
                 </>
               ) : (
                 <>
                  <button onClick={() => updateApproval(chw.id, true)}>Approve</button>{' '}
                  <button onClick={() => updateApproval(chw.id, false)}>Reject</button>
  </>
)}

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCHWApproval;