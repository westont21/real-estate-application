import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute'; // Make sure to import your ProtectedRoute
import ContractCreator from './components/ContractCreator';
import ContractList from './components/ContractList';
import Logout from './components/Logout'; // Import the Logout component
import AboutUs from './components/AboutUs'; // Import the About Us component
import Contracts from './components/Contracts'; // Import the Contracts component

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/contracts/creator" element={
            <ProtectedRoute>
              <ContractCreator />
            </ProtectedRoute>
          } />
          <Route path="/contracts/list" element={
            <ProtectedRoute>
              <ContractList />
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} /> {/* Add the route for logout */}
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
