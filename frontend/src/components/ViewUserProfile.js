import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Profile.css';

const ViewUserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/users/${userId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="header">Profile</h1>
      {user.profilePicture && (
        <img
          src={user.profilePicture}
          alt="Profile"
          className="profileImage"
        />
      )}
      <div className="formGroup">
        <label className="formLabel">Username:</label>
        <input
          type="text"
          value={user.username}
          readOnly
          className="formInput"
        />
      </div>
      <div className="formGroup">
        <label className="formLabel">Email:</label>
        <input
          type="text"
          value={user.email}
          readOnly
          className="formInput"
        />
      </div>
    </div>
  );
};

export default ViewUserProfile;
