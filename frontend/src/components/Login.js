import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { auth } = useAuth(); // Destructure to get the 'auth' object from context
    console.log('Current Auth State:', auth);

    // Redirect if already logged in
    if (auth.isAuthenticated) {
        console.log('Current Auth State:', auth);
        navigate('/'); // Redirect to the root if already logged in
    }

    const handleLogin = async () => {
        // Redirect to initiate OAuth flow
        window.location.href = "https://localhost:5001/auth/google"; 
        console.log('Current Auth State:', auth);
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

Session Persistence: Make sure your session or user authentication state persists across page reloads 
and navigation. This typically involves setting cookies or session tokens that your backend recognizes
and validates on each request.

Conditional Rendering: Depending on how your application is structured, you might want to conditionally 
render navigation links or other components based on the user's authentication status. 
This could include showing a logout link or hiding the login button if the user is already logged in.

*/