
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch('https://smart-expense-splitter-backend.vercel.app/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };
    fetchUserData();

    // Listen for auth changes (login/logout/token cleared) from other parts of the app
    const handleAuthChange = () => {
      fetchUserData();
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    setUser(null);
    // notify other components that auth changed
    try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* ignore */ }
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1 onClick={() => navigate('/')}>💰 Expense Splitter</h1>
        </div>
        <div className="navbar-menu">
          {Cookies.get('token') ? (
            <>
              <span className="user-name">Welcome, {user ? user.name : 'User'}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
