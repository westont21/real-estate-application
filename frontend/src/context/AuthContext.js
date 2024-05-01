import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ isAuthenticated: false });

    useEffect(() => {
        // This function checks the current auth state when the component mounts
        const verifySession = async () => {
            try {
                const response = await fetch('https://localhost:5001/verify', {
                    method: 'GET', 
                    credentials: 'include'
                });
                const data = await response.json();
                console.log(data)
                if (response.ok && data.isAuthenticated) {
                    setAuth({ isAuthenticated: true, user: data.user });
                } else {
                    setAuth({ isAuthenticated: false });
                    console.log("CAUGHT IN ELSE: NOT AUTHED")
                }
            } catch (error) {
                console.error('Session verification failed:', error);
            }
        };

        verifySession();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
