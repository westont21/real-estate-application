import React, { useState } from 'react';
import '../styles/MessageForm.css';

const MessageForm = ({ receiverId, onMessageSent, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { receiverId, message };
      console.log('Sending payload:', payload); // Log the payload to debug
      const response = await fetch('https://localhost:5001/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to send message: ${errorData.error}`);
      }
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
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          required
        />
      </label>
      <button type="submit" className="btn">Send Message</button>
    </form>
  );
};

export default MessageForm;
