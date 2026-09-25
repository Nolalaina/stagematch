import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('stagematch_user');
    return raw ? JSON.parse(raw) : null;
  });

  function login(token, user) {
    localStorage.setItem('stagematch_token', token);
    localStorage.setItem('stagematch_user', JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem('stagematch_token');
    localStorage.removeItem('stagematch_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
