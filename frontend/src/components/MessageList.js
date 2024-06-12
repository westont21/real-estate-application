import React, { useEffect, useState, useCallback } from 'react';
import '../styles/MessageList.css';

const MessageList = ({ onSelectUser }) => {
  const [uniqueUsers, setUniqueUsers] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch('https://localhost:5001/api/messages', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      extractUniqueUsers(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const extractUniqueUsers = (messages) => {
    const users = {};
    messages.forEach((message) => {
      const user = message.sender;
      if (!users[user._id]) {
        users[user._id] = user;
      }
    });
    setUniqueUsers(Object.values(users));
  };

  return (
    <div className="message-list">
      {uniqueUsers.map((user) => (
        <div key={user._id} className="message" onClick={() => onSelectUser(user)}>
          <img
            src={user.profilePicture}
            alt={user.username}
            className="profile-picture"
          />
          <div className="message-content">
            <strong>{user.username}</strong>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
