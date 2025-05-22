import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [chaId, setChaId] = useState(null);
  const [token, setToken] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    // On mount, load from localStorage
    const storedChaId = localStorage.getItem('cha_id');
    const storedToken = localStorage.getItem('token');
    const storedName = localStorage.getItem('cha_name');

    if (storedChaId) setChaId(parseInt(storedChaId));
    if (storedToken) setToken(storedToken);
    if (storedName) setName(storedName);
  }, []);

  const login = ({ cha_id, token, name }) => {
    localStorage.setItem('cha_id', cha_id);
    localStorage.setItem('token', token);
    localStorage.setItem('cha_name', name);

    setChaId(cha_id);
    setToken(token);
    setName(name);
  };

  const logout = () => {
    localStorage.removeItem('cha_id');
    localStorage.removeItem('token');
    localStorage.removeItem('cha_name');

    setChaId(null);
    setToken(null);
    setName(null);
  };

  return (
    <AuthContext.Provider value={{ chaId, token, name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
