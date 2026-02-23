import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('strikezone_token');
    const storedUser = localStorage.getItem('strikezone_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const signin = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/signin`, { email, password });
    const { token: newToken, user: userData } = res.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('strikezone_token', newToken);
    localStorage.setItem('strikezone_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    return userData;
  };

  const signup = async (email, password, fullName, companyName) => {
    const res = await axios.post(`${API_URL}/api/auth/signup`, {
      email,
      password,
      fullName,
      companyName,
    });
    return res.data;
  };

  const signout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('strikezone_token');
    localStorage.removeItem('strikezone_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
    return res.data;
  };

  const resetPassword = async (resetToken, password) => {
    const res = await axios.post(`${API_URL}/api/auth/reset-password`, { token: resetToken, password });
    return res.data;
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`);
      setUser(res.data.user);
      localStorage.setItem('strikezone_user', JSON.stringify(res.data.user));
    } catch (err) {
      signout();
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAdmin,
      isAuthenticated,
      signin,
      signup,
      signout,
      forgotPassword,
      resetPassword,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
