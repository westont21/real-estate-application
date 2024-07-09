import React, { useEffect, useState, useCallback } from 'react';
import '../styles/MessageThread.css';
import { useAuth } from '../context/AuthContext';
import MessageForm from './MessageForm';

const MessageThread = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const { auth } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!user || !auth.user) return;

    try {
      const response = await fetch('https://localhost:5001/api/messages', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      console.log('Fetched messages:', data);

      const loggedInUserId = auth.user.id;

      const filteredMessages = data.filter((message) => {
        const senderId = message.sender._id || message.sender;
        const receiverId = message.receiver._id || message.receiver;

        return (
          (senderId === loggedInUserId || receiverId === loggedInUserId) &&
          (senderId === user._id || receiverId === user._id)
        );
      });

      filteredMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      console.log('Filtered messages:', filteredMessages);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [auth.user, user]);

  useEffect(() => {
    console.log('Fetching messages for user:', user);
    fetchMessages();
  }, [fetchMessages, user]);

  const handleMessageSent = (newMessage) => {
    const updatedMessage = {
      ...newMessage,
      sender: { _id: auth.user.id }, // Ensure sender ID is correctly set
    };
    setMessages((prevMessages) => [...prevMessages, updatedMessage]);
  };

  return (
    <div className="message-thread">
      <div className="message-thread-messages">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message-bubble ${message.sender._id === auth.user.id ? 'my-message' : 'other-message'}`}
          >
            {message.message}
          </div>
        ))}
      </div>
      <MessageForm receiverId={user._id} onMessageSent={handleMessageSent} />
    
    </div>
  );
};

export default MessageThread;
