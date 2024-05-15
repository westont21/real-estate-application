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
       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
           <button onClick={handleLogout}>Logout</button>
       </div>
   );
};


export default LogoutButton;


