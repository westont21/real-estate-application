import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewPosts.css';

const ViewPosts = () => {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({ sortBy, sortOrder }).toString();
      const response = await fetch(`https://localhost:5001/api/posts?${queryParams}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/posts/search?username=${searchUsername}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to search posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
  };

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleCreatePostClick = () => {
    navigate('/posts/create');
  };

  return (
    <div className="view-posts-container">
      <h1>View Posts</h1>
      <button className="create-post-button" onClick={handleCreatePostClick}>Create Post</button>
      <div className="controls">
        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="name">Name</option>
            <option value="createdAt">Date Created</option>
          </select>
        </label>
        <label>
          Order:
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
      <div className="search">
        <input
          type="text"
          placeholder="Search by username"
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="posts">
        {posts.map((post) => (
          <div key={post._id} className="post">
            <div className="post-header">
              <img
                src={post.user.profilePicture}
                alt={post.user.username}
                className="profile-picture"
                onClick={() => handleProfileClick(post.user._id)}
              />
              <div className="user-info">
                <h3>{post.name}</h3>
                <p><strong>Posted by:</strong> {post.user.username}</p>
              </div>
            </div>
            <p>{post.description}</p>
            <p><strong>Created at:</strong> {new Date(post.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPosts;
