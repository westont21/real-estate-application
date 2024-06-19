import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import '../styles/SignContract.css';

function SignContract() {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [placeholders, setPlaceholders] = useState({});
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(true);
  const sigCanvas = useRef(null);

  const fetchContract = async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/contracts/${contractId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }
      const data = await response.json();
      setContract(data);
      setTemplateContent(data.templateContent);
      setPlaceholders(data.placeholders || {});
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const saveSignature = () => {
    const signatureData = sigCanvas.current.toDataURL();
    setPlaceholders({
      ...placeholders,
      client_signature: signatureData
    });
  };

  const saveSignatureToBackend = async () => {
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
        fetchContract(); // Fetch the contract again to get updated data
      } catch (error) {
        console.error('Error saving signature:', error);
        alert('Failed to save signature');
      }
    } else {
      alert('Please provide a signature');
    }
  };

  const renderTemplateContent = () => {
    const contentArray = templateContent.split(/({{.*?}})/g);

    return contentArray.map((part, index) => {
      const match = part.match(/{{(.*?)}}/);
      if (match) {
        const placeholder = match[1];
        const isSignature = placeholder.includes('signature');
        return (
          <span key={index} className="inline-input">
            {isSignature ? (
              <span className="signature-placeholder" onClick={saveSignature}>
                {placeholders[placeholder] ? (
                  <img
                    src={placeholders[placeholder]}
                    alt="Signature"
                    className="signature-image"
                  />
                ) : (
                  '______________________'
                )}
              </span>
            ) : (
              <textarea
                value={placeholders[placeholder]}
                placeholder={placeholder}
                className="placeholder-input"
                readOnly
              />
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (loading) {
    return <div>Loading contract...</div>;
  }

  return (
    <div className="contract-creator-container">
      <h2>Sign Contract</h2>
      <form className="contract-form">
        {templateContent && (
          <div className="template-preview">
            {renderTemplateContent()}
          </div>
        )}
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
        <button type="button" onClick={saveSignatureToBackend} className="submit-button">
          Submit Signature
        </button>
      </form>
    </div>
  );
}

export default SignContract;
