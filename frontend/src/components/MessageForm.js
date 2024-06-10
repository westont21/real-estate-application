import React, { useState } from 'react';
import '../styles/Messaging.css';

const MessageForm = ({ onMessageSent }) => {
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');

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
      onMessageSent(data);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <label>
        To:
        <input
          type="text"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="Receiver ID"
          required
        />
      </label>
      <label>
        Message:
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          required
        />
      </label>
      <button type="submit">Send Message</button>
    </form>
  );
};

export default MessageForm;
