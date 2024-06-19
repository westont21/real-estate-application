import React, { useState, useEffect } from 'react';
import '../styles/ComposeMessage.css';

const ComposeMessage = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('https://localhost:5001/api/users', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/users/search?query=${query}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="compose-message">
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <input
          type="text"
          placeholder="Search for users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>
      <div className="search-results">
        {users.map((user) => (
          <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
            <img src={user.profilePicture} alt={user.username} className="profile-picture" />
            <span>{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComposeMessage;
