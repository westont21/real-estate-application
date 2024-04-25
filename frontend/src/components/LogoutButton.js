import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    // Example of a logout function in a React component
    const handleLogout = async () => {
        try {
            const response = await fetch('https://localhost:5001/logout', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                setAuth({ isAuthenticated: false });
                navigate('/');
            } else {
                throw new Error('Failed to logout');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
    


    return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
