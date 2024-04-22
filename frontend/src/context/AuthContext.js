/*
    We create an AuthContext that stores authentication status and user data.
    An AuthProvider component wraps the application's component tree to provide this context.
    We use an effect to check the user's session when the application loads, which helps in 
    persisting user login state across page reloads.
*/
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ isAuthenticated: false });

    useEffect(() => {
        // Check auth state on component mount
        const checkAuth = async () => {
            try {
                const response = await axiosInstance.get('/verify');
                if (response.data.isAuthenticated) {
                    setAuth({ isAuthenticated: true });
                }
            } catch (error) {
                console.log('Auth check failed', error);
                setAuth({ isAuthenticated: false, user: null }); // Properly handle not authenticated state
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

