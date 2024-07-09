import React, { useState, useEffect, useCallback } from 'react';
import '../styles/MessagingBar.css';
import MessageThread from './MessageThread';
import ComposeMessage from './ComposeMessage';
import { FaPen, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const MessagingBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const { auth } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!auth.user || !auth.user.id) {
      console.error('User ID is not defined in auth object');
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/messages', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();

      console.log('Fetched messages:', data);

      const users = {};
      data.forEach((message) => {
        const senderId = message.sender._id || message.sender;
        const receiverId = message.receiver._id || message.receiver;

        console.log('Processing message:', message);
        console.log('Sender ID:', senderId);
        console.log('Receiver ID:', receiverId);
        console.log('Logged in user ID:', auth.user.id);

        if (senderId !== auth.user.id && !users[senderId]) {
          users[senderId] = message.sender;
        }
        if (receiverId !== auth.user.id && !users[receiverId]) {
          users[receiverId] = message.receiver;
        }
      });

      const uniqueUsersList = Object.values(users);
      console.log('Processed unique users (filtered):', uniqueUsersList);
      setUniqueUsers(uniqueUsersList);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [auth.user.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    console.log('Unique users updated:', uniqueUsers);
  }, [uniqueUsers]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsComposing(false);
  };

  const handleComposeClick = (e) => {
    e.stopPropagation();  // Prevent the messaging bar from closing when clicking compose
    setIsComposing(true);
    setSelectedUser(null);
  };

  const handleMessageSentCallback = () => {
    fetchMessages();
  };

  useEffect(() => {
    const messageThread = document.querySelector('.message-thread-messages');
    if (messageThread) {
      messageThread.scrollTop = messageThread.scrollHeight;
    }
  }, [selectedUser]);

  return (
    <div>
      <div className={`messaging-bar ${isOpen ? 'open' : ''}`} onClick={handleToggle}>
        <div className="messaging-header">
          <span>Messages</span>
          <button className="compose-button" onClick={handleComposeClick}>
            <FaPen />
          </button>
        </div>
        {isOpen && (
          <div className="messaging-content">
            {uniqueUsers.length === 0 ? (
              <p>No messages found.</p>
            ) : (
              uniqueUsers.map((user) => (
                <div key={user._id} className="message" onClick={() => handleUserSelect(user)}>
                  <img
                    src={user.profilePicture}
                    alt={user.username}
                    className="profile-picture"
                  />
                  <div className="message-content">
                    <strong>{user.username}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="message-thread-bar">
          <div className="message-thread-header">
            <span>{selectedUser.username}</span>
            <button className="close-button" onClick={() => setSelectedUser(null)}>
              <FaTimes />
            </button>
          </div>
          <MessageThread user={selectedUser} onMessageSentCallback={handleMessageSentCallback} />
        </div>
      )}
      {isComposing && (
        <div className="compose-message-bar">
          <div className="compose-message-header">
            <span>Compose Message</span>
            <button className="close-button" onClick={() => setIsComposing(false)}>
              <FaTimes />
            </button>
          </div>
          <ComposeMessage onSelectUser={handleUserSelect} />
        </div>
      )}
    </div>
  );
};

export default MessagingBar;
