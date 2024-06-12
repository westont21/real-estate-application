import React, { useState } from 'react';
import '../styles/MessageForm.css';

const MessageForm = ({ receiverId, onMessageSent }) => {
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
      if (onMessageSent) onMessageSent(data);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
        required
      />
      <button type="submit" className="btn">Send Message</button>
    </form>
  );
};

export default MessageForm;
