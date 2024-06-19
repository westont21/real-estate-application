import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    async function fetchContracts() {
      try {
        const response = await fetch('https://localhost:5001/api/contracts/all', {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    }

    fetchContracts();
  }, []);

  const handleViewContract = (id) => {
    navigate(`/view-contract/${id}`);
  };

  const handleShareContract = (id) => {
    navigate(`/share-contract/${id}`);
  };

  const handleSignContract = (id) => {
    navigate(`/sign-contract/${id}`);
  };

  return (
    <div>
      <h2>Your Contracts</h2>
      {contracts.length === 0 ? (
        <p>No contracts found.</p>
      ) : (
        <ul>
          {contracts.map((contract) => (
            <li key={contract._id}>
              <button onClick={() => handleViewContract(contract._id)}>
                View Contract
              </button>
              {contract.userId === auth.user?.id ? (
                <button onClick={() => handleShareContract(contract._id)}>
                  Share Contract
                </button>
              ) : contract.sharedWith.includes(auth.user?.id) && !contract.isFinalized ? (
                <button onClick={() => handleSignContract(contract._id)}>
                  Sign Contract
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContractList;
