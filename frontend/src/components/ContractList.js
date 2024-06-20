import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [contractUrl, setContractUrl] = useState('');
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
        setContracts(data.filter(contract => !contract.deleted));
      } catch (error) {
        console.error('Error fetching contracts:', error);
      }
    }

    fetchContracts();
  }, []);

  const handleViewContract = async (id) => {
    try {
      const response = await fetch(`https://localhost:5001/api/contracts/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch contract URL');
      }
      const data = await response.json();
      setContractUrl(data.url);
    } catch (error) {
      console.error('Error fetching contract URL:', error);
    }
  };

  const handleShareContract = (id) => {
    navigate(`/share-contract/${id}`);
  };

  const handleSignContract = (id) => {
    navigate(`/sign-contract/${id}`);
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }
    
    try {
      const response = await fetch(`https://localhost:5001/api/contracts/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }
      const data = await response.json();
      alert(data.message);
      setContracts(contracts.filter(contract => contract._id !== id));
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract');
    }
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
                <>
                  <button onClick={() => handleShareContract(contract._id)}>
                    Share Contract
                  </button>
                  {!contract.isFinalized && (
                    <button onClick={() => handleDeleteContract(contract._id)}>
                      Delete Contract
                    </button>
                  )}
                </>
              ) : contract.sharedWith.includes(auth.user?.id) && !contract.isFinalized ? (
                <button onClick={() => handleSignContract(contract._id)}>
                  Sign Contract
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {contractUrl && (
        <iframe title="Contract PDF" src={contractUrl} style={{ width: '100%', height: '1000px' }} />
      )}
    </div>
  );
}

export default ContractList;
