import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();

    const handleLogout = async () => {
        try {
            const response = await fetch('https://localhost:5001/logout', {
                method: 'GET',
                credentials: 'include', // Ensure cookies are sent with the request
            });
            if (response.ok) {
                setAuth({ isAuthenticated: false });
                navigate('/'); // Redirect to home on successful logout
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <button onClick={handleLogout}>Logout</button>
    );
};

export default LogoutButton;

/*
Check: Ensure that LogoutButton correctly handles the session termination on the backend, 
and it might be useful to force a refresh or use a callback to update the authentication state 
across the app when logging out.
*/
