import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/ViewPosts.css';

const ViewPosts = () => {
  const { auth } = useAuth();
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [searchUsername, setSearchUsername] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [sortBy, sortOrder]);

  const fetchPosts = async () => {
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
  };

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

  return (
    <div className="view-posts-container">
      <h1>View Posts</h1>
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
            <h3>{post.name}</h3>
            <p>{post.description}</p>
            <p>
              <strong>Posted by:</strong> {post.user.username} ({post.user.email})
            </p>
            <p>
              <strong>Created at:</strong> {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPosts;
