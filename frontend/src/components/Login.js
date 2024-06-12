import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function Login() {
   const navigate = useNavigate();
   const location = useLocation();
   const { auth } = useAuth(); // Destructure to get the 'auth' object from context


   // Redirect if already logged in
   useEffect(() => {
       if (auth.isAuthenticated) {
           console.log('ALREADY LOGGED IN:', auth);
           const from = location.state?.from?.pathname || "/";
           navigate(from, { replace: true }); // Redirect to the intended route or home if no redirect is needed
       }
   }, [auth, navigate, location.state]);


   const handleLogin = () => {
       // Redirect to initiate OAuth flow with prompt
       window.location.href = "https://localhost:5001/auth/google?prompt=select_account";
   };


   return (
       <div>
           <h1>Login</h1>
           <button onClick={handleLogin}>Login with Google</button>
       </div>
   );
}


export default Login;