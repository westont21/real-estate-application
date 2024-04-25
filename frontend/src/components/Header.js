// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useAuth();

    const handleLogout = async () => {
        try {
            await fetch('https://localhost:5001/logout', {
                method: 'GET',
                credentials: 'include',
            });
            setAuth({ isAuthenticated: false });
            navigate('/'); // This will cause a re-render if Routes are set up correctly
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f8f8f8' }}>
            <div className="logo">
                <Link to="/">Home</Link>
            </div>
            <nav>
                <Link to="/how-it-works">How It Works</Link>
                <Link to="/about-us">About Us</Link>
                <Link to="/contact">Contact</Link>
                {auth.isAuthenticated ? (
                    <button onClick={handleLogout} style={{ padding: '8px', marginRight: '10px' }}>Logout</button>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
