import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute'; // Make sure to import your ProtectedRoute
import ContractCreator from './components/ContractCreator';

const App = () => {
    return (
        <AuthProvider>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/contract/creator" element={
                        <ProtectedRoute>
                            <ContractCreator />
                        </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                </Routes>
                <Footer />
            </div>
        </AuthProvider>
    );
};

export default App;
