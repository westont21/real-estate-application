import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ClientSignature.css'; // Import the CSS file for styling

function ClientSignature() {
  const { id } = useParams();
  const [signature, setSignature] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`https://localhost:5001/api/contracts/add-client-signature/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ signature })
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);
    } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className="client-signature-container">
      <h2>Sign Contract</h2>
      <form onSubmit={handleSubmit} className="signature-form">
        <label>
          Your Signature:
          <input
            type="text"
            value={signature}
            placeholder="Your Signature"
            className="signature-input"
            onChange={(e) => setSignature(e.target.value)}
          />
        </label>

        <button type="submit" className="submit-button">Add Signature</button>
      </form>
    </div>
  );
}

export default ClientSignature;
