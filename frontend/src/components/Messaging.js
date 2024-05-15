import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Messaging.css';

const Messaging = ({ receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/messages`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.filter(msg => msg.receiver._id === receiverId || msg.sender._id === receiverId));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [receiverId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://localhost:5001/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiverId, message })
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      setMessages((prevMessages) => [...prevMessages, data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="messaging-container">
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg._id} className="message">
            <img src={msg.sender.profilePicture} alt={msg.sender.username} className="profile-picture" />
            <div className="message-content">
              <strong>{msg.sender.username}</strong>
              <p>{msg.message}</p>
              <span className="message-time">{new Date(msg.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          required
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Messaging;
