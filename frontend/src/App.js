import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';

function App() {
    return (
        <AuthProvider> {/* Wrap all routes with AuthProvider */}
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                {/* Additional routes can be added here */}
            </Routes>
            <Footer />
        </AuthProvider>
    );
}

export default App;


/*
If your app includes more conditional logic based on the user state, you might want to 
handle that within your React context or use additional routes that depend on user status. 
For instance, a user profile page that should only be accessible when logged in.
*/
