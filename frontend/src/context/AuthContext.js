import React, { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext({});


export const AuthProvider = ({ children }) => {
   const [auth, setAuth] = useState({ isAuthenticated: false });


   useEffect(() => {
       const verifySession = async () => {
           try {
               const response = await fetch('https://localhost:5001/verify', {
                   method: 'GET',
                   credentials: 'include'
               });
               const data = await response.json();
               if (response.ok && data.isAuthenticated) {
                   setAuth({ isAuthenticated: true, user: data.user });
               } else {
                   setAuth({ isAuthenticated: false });
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
