import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('email'));
  const navigate = useNavigate();

  const login = (newToken, email) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('email', email);
    setToken(newToken);
    setUserEmail(email);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    setUserEmail(null);
    navigate('/login');
  };

  return { token, userEmail, login, logout, isAuthenticated: !!token };
};
