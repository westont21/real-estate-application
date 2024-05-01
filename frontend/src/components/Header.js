import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton'; // Ensure the path is correct
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { auth } = useAuth();
    console.log('Current Auth State in header:', auth);

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
                    <LogoutButton />
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
