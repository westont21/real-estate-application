import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Update the loginUser function to be part of the component so it can access email and password states
    const loginUser = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, {
                email, // use state variable
                password // use state variable
            });
            console.log('Login response:', response.data);
            // Redirect user or store the token in local storage
            // For example, you could use localStorage to store the token:
            // localStorage.setItem('token', response.data.token);  NOTE: DON'T USE LOCAL STORAGE
            // Redirect to another page, you might want to use useHistory hook from react-router-dom
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : "Network error");
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        loginUser();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <label>
                Email:
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
            <label>
                Password:
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;

/* 
Secure Storage: For production, consider using a more secure way to handle authentication tokens than localStorage, which is susceptible to XSS attacks. Libraries like Secure-Ls can encrypt the data stored in LocalStorage.
Use Environment Variables: Ensure that .env files are set up correctly in your React project and that REACT_APP_API_URL is defined in your .env.local or similar environment file.
React Router for Redirection: If you want to redirect the user after login, you can use the useNavigate hook from react-router-dom in React Router v6.
*/ 
