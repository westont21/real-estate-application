// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header>
            <div className="logo">Real Estate Connection</div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/how-it-works">How It Works</Link>
                <Link to="/about-us">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/login">Login/Sign Up</Link>
            </nav>
        </header>
    );
}

export default Header;
