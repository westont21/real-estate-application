import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ContractCreator from './components/ContractCreator';
import ClientSignature from './components/ClientSignature';
import ContractList from './components/ContractList';
import Logout from './components/Logout';
import AboutUs from './components/AboutUs';
import Contracts from './components/Contracts';
import CreatePost from './components/CreatePost';
import ViewPosts from './components/ViewPosts';
import UserProfile from './components/UserProfile';
import UserSearch from './components/UserSearch';

import ContractPreview from './components/ContractPreview';

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Link to="/" style={{ color: 'black', textDecoration: 'none', position: 'absolute', top: '10px', left: '10px' }}>Home</Link> {/* Add Link for Home */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

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

          <Route path="/contract/sign/:id" element={
            <ProtectedRoute>
              <ClientSignature />
            </ProtectedRoute>
          } />

          <Route path="/contracts/list" element={
            <ProtectedRoute>
              <ContractList />
            </ProtectedRoute>
          } />

          <Route path="/posts/create" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />

          <Route path="/posts/view" element={
            <ProtectedRoute>
              <ViewPosts />
            </ProtectedRoute>
          } />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          <Route path="/users/search" element={
            <ProtectedRoute>
              <UserSearch />
            </ProtectedRoute>
          } />

          <Route path="/test" element={
            <ProtectedRoute>
              <ContractPreview />
            </ProtectedRoute>
          } />


        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
