import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const { auth } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.isAuthenticated) {
      alert('You must be signed in to create a post.');
      return;
    }

    const post = {
      name,
      description,
    };

    try {
      const response = await fetch('https://localhost:5001/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(post),
      });

      if (response.ok) {
        alert('Post created successfully!');
        setName('');
        setDescription('');
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="create-post-container">
      <h1>Create a Post</h1>
      <p>
        Use this page to create a post if you're a home buyer looking for a realtor with a specific commission rate. Describe your needs and preferences to attract the right realtor for you.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn-submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
