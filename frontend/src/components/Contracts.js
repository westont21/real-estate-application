import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contracts.css'; // Import the CSS file for styling

const Contracts = () => {
  return (
    <div className="contracts-container">
      <Link to="/" style={{ color: 'black', textDecoration: 'none', position: 'absolute', top: '10px', left: '10px' }}>Home</Link> {/* Add Link for Home */}
      <h1>Manage Your Contracts</h1>
      <p>
        Welcome to the Contracts section. Here you can create new contracts using our template-based system or view your existing contracts. Choose an option below to get started.
      </p>
      <div className="contracts-options">
        <div className="option-card">
          <h2>Create a Contract</h2>
          <p>
            Use our intuitive contract creator to select a template, fill in the details, and generate a contract tailored to your needs.
          </p>
          <Link to="/contract/creator" className="btn">Create Contract</Link>
        </div>
        <div className="option-card">
          <h2>View Existing Contracts</h2>
          <p>
            View and manage your previously created contracts. Access them anytime from this section.
          </p>
          <Link to="/contracts/list" className="btn">View Contracts</Link>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
