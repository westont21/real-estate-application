import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { auth } = useAuth(); // Destructure to get the 'auth' object from context
    console.log('Current Auth State in login:', auth);

    // Redirect if already logged in
    if (auth.isAuthenticated) {
        console.log('ALREADY LOGGED IN:', auth);
        navigate('/'); // Redirect to the root if already logged in
    }
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


/*
Considerations

Session Perosistence: Make sure your session r user authentication state persists across page reloads 
and navigation. This typically involves setting cookies or session tokens that your backend recognizes
and validates on each request.

Conditional Rendering: Depending on how your application is structured, you might want to conditionally 
render navigation links or other components based on the user's authentication status. 
This could include showing a logout link or hiding the login button if the user is already logged in.

*/