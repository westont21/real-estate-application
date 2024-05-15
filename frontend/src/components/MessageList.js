import React, { useEffect, useState } from 'react';
import '../styles/Messaging.css';

const MessageList = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/messages', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div key={message._id} className="message">
          <img
            src={message.sender.profilePicture}
            alt={message.sender.username}
            className="profile-picture"
          />
          <div className="message-content">
            <strong>{message.sender.username}</strong>
            <p>{message.message}</p>
            <span className="message-time">{new Date(message.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
