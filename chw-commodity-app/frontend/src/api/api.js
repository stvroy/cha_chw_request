const API_URL = 'http://localhost:5050/api';

export async function fetchCHWs() {
  const res = await fetch(`${API_URL}/chws`);
  return res.json();
}

export async function fetchCommodities() {
  const res = await fetch(`${API_URL}/commodities`);
  return res.json();
}

export async function submitRequest(data) {
  const res = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchRequests() {
  const res = await fetch(`${API_URL}/requests`);
  return res.json();
}

// Fetch requests pending CHA approval
// api/api.js
export async function fetchPendingRequests(chaId) {
  const res = await fetch(`http://localhost:5050/api/cha/${chaId}/requests`);
  if (!res.ok) throw new Error('Failed to fetch requests');
  return res.json();
}
// export async function fetchPendingRequests() {
//   try {
//     const res = await fetch(`${API_URL}/requests/pending`);
//     if (!res.ok) throw new Error('Failed to fetch pending requests');
//     return await res.json();
//   } catch (err) {
//     console.error(err);
//     return [];
//   }
// }

// Approve a request
export async function approveRequest(requestId) {
  try {
    const res = await fetch(`${API_URL}/requests/${requestId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: 'Failed to approve request' };
  }
}

// Reject a request
export async function rejectRequest(requestId) {
  try {
    const res = await fetch(`${API_URL}/requests/${requestId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject' }),
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: 'Failed to reject request' };
  }
}
