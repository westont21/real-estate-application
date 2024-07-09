import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import ShareContract from './components/ShareContract';
import SignContract from './components/SignContract';
import ContractPreview from './components/ContractPreview';
import MessagingBar from './components/MessagingBar'; // Correctly importing MessagingBar

const App = () => {
  return (
    <AuthProvider>
      <div className="App">
        <header className="App-header">
          <Link to="/" style={{ color: 'black', textDecoration: 'none', position: 'absolute', top: '10px', left: '10px' }}>Home</Link>
        </header>
        <main className="App-content">
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
            <Route path="/share-contract/:contractId" element={<ShareContract />} />
            <Route path="/sign-contract/:contractId" element={<SignContract />} />
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
        </main>
        <AuthBasedMessagingBar />
        <Footer />
      </div>
    </AuthProvider>
  );
};

const AuthBasedMessagingBar = () => {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) return null;
  return <MessagingBar />;
};

export default App;
