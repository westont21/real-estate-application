import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/UserSearch.css';

const ShareContract = () => {
  const { contractId } = useParams();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`https://localhost:5001/api/users`, {
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

  const handleShare = async (clientId) => {
    try {
      const response = await fetch(`https://localhost:5001/api/contracts/share-contract/${contractId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId })
      });

      if (response.ok) {
        alert('Contract shared with client successfully!');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sharing contract:', error);
      alert('Failed to share contract.');
    }
  };

  return (
    <div className="user-search-container">
      <input
        type="text"
        placeholder="Search users by name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div className="user-list">
        {users.map((user) => (
          <div key={user._id} className="user-item">
            <img src={user.profilePicture} alt={user.username} className="profile-picture" />
            <span>{user.username}</span>
            <button onClick={() => handleShare(user._id)}>Share</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareContract;
