import React, { useState } from 'react';
import '../styles/ComposeMessage.css';

const ComposeMessage = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://localhost:5001/api/users?query=${query}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="compose-message">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users"
          required
        />
        <button type="submit">Search</button>
      </form>
      <div className="search-results">
        {results.map((user) => (
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
