import React, { useState, useEffect } from 'react';
import '../styles/MessagingBar.css';
import MessageList from './MessageList';
import MessageThread from './MessageThread';
import ComposeMessage from './ComposeMessage'; // Import ComposeMessage component
import { FaPen } from 'react-icons/fa';

const MessagingBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isComposing, setIsComposing] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsComposing(false);
  };

  const handleComposeClick = () => {
    setIsComposing(true);
    setSelectedUser(null);
  };

  useEffect(() => {
    const messageThread = document.querySelector('.message-thread-messages');
    if (messageThread) {
      messageThread.scrollTop = messageThread.scrollHeight;
    }
  }, [selectedUser]);

  return (
    <div>
      <div className={`messaging-bar ${isOpen ? 'open' : ''}`}>
        <div className="messaging-header" onClick={handleToggle}>
          <span>Messages</span>
          <button className="compose-button" onClick={handleComposeClick}>
            <FaPen />
          </button>
        </div>
        {isOpen && (
          <div className="messaging-content">
            <MessageList onSelectUser={handleUserSelect} />
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="message-thread-bar">
          <div className="message-thread-header">
            <span>{selectedUser.username}</span>
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
          <MessageThread user={selectedUser} />
        </div>
      )}
      {isComposing && (
        <div className="compose-message-bar">
          <div className="compose-message-header">
            <span>Compose Message</span>
            <button onClick={() => setIsComposing(false)}>Close</button>
          </div>
          <ComposeMessage onSelectUser={handleUserSelect} />
        </div>
      )}
    </div>
  );
};

export default MessagingBar;
