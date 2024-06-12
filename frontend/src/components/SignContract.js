import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import '../styles/SignContract.css';

function SignContract() {
    const { contractId } = useParams(); // Get contract ID from URL parameters
  console.log(contractId)
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const sigCanvas = useRef(null);

  useEffect(() => {
    async function fetchContract() {
      try {
        const response = await fetch(`https://localhost:5001/api/contracts/${contractId}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch contract');
        }
        const data = await response.json();
        setContract(data);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContract();
  }, [contractId]);

  const saveSignature = async () => {
    if (!sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.toDataURL();
      try {
        const response = await fetch(`https://localhost:5001/api/contracts/add-client-signature/${contractId}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signature: signatureData }),
        });
        if (!response.ok) {
          throw new Error('Failed to save signature');
        }
        alert('Signature added successfully!');
      } catch (error) {
        console.error('Error saving signature:', error);
        alert('Failed to save signature');
      }
    } else {
      alert('Please provide a signature');
    }
  };

  if (loading) {
    return <div>Loading contract...</div>;
  }

  return (
    <div className="sign-contract-container">
      {contract ? (
        <div>
          <h2>Sign Contract</h2>
          <iframe
            title="Contract PDF"
            src={contract.url}
            style={{ width: '100%', height: '500px', marginBottom: '20px' }}
          />
          <div className="signature-section">
            <h3>Your Signature:</h3>
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: 'signature-canvas' }}
            />
            <button type="button" onClick={saveSignature} className="save-button">
              Save Signature
            </button>
          </div>
        </div>
      ) : (
        <div>Failed to load contract</div>
      )}
    </div>
  );
}

export default SignContract;
