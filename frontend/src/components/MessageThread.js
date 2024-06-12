import React, { useEffect, useState, useCallback } from 'react';
import '../styles/MessageThread.css';
import MessageForm from './MessageForm';

const MessageThread = ({ user }) => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/messages`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.filter(msg => msg.receiver._id === user._id || msg.sender._id === user._id));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user._id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const messageThread = document.querySelector('.message-thread-messages');
    if (messageThread) {
      messageThread.scrollTop = messageThread.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="message-thread">
      <div className="message-thread-messages">
        {messages.map((msg, index) => (
          <div key={msg._id} className={`message-bubble ${msg.sender._id === user._id ? 'other-message' : 'my-message'}`}>
            <p>{msg.message}</p>
            <span className="message-time">
              {index === 0 || new Date(messages[index - 1].createdAt).toLocaleDateString() !== new Date(msg.createdAt).toLocaleDateString() ?
                new Date(msg.createdAt).toLocaleDateString() : ''}
            </span>
          </div>
        ))}
      </div>
      <MessageForm receiverId={user._id} onMessageSent={fetchMessages} />
    </div>
  );
};

export default MessageThread;
