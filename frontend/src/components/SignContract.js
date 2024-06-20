import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import '../styles/SignContract.css';

function SignContract() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [placeholders, setPlaceholders] = useState(new Map());
  const [templateContent, setTemplateContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  const [signatureVisible, setSignatureVisible] = useState(true);
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
      setPlaceholders(new Map(Object.entries(data.placeholders)));
      setIsFinalized(data.isFinalized);
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
    const signDate = new Date().toLocaleString(); // Capture the current date and time

    setPlaceholders(new Map(placeholders).set('client_signature', signatureData).set('client_sign_date', signDate));
  };

  const eraseSignature = () => {
    sigCanvas.current.clear();
  };

  const removeSignature = () => {
    setPlaceholders(new Map(placeholders).set('client_signature', '').set('client_sign_date', ''));
    sigCanvas.current.clear();
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
        const data = await response.json();
        alert('Signature added successfully!');
        setContract(data.contract); // Update contract data with the latest contract
        setPlaceholders(new Map(Object.entries(data.contract.placeholders)));
        setIsFinalized(true);
        setSignatureVisible(false);
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
        const isSignDate = placeholder.includes('sign_date');
        return (
          <span key={index} className="inline-input">
            {isSignature ? (
              <span className="signature-placeholder">
                {placeholders.get(placeholder) ? (
                  <img
                    src={placeholders.get(placeholder)}
                    alt="Signature"
                    className="signature-image"
                  />
                ) : (
                  '______________________'
                )}
              </span>
            ) : isSignDate ? (
              <span className="sign-date">{placeholders.get(placeholder)}</span>
            ) : (
              <textarea
                value={placeholders.get(placeholder)}
                placeholder={placeholder}
                className="placeholder-input"
                readOnly={isSignDate} // Make sign date fields read-only
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
      <div className="header">
        <h2>Sign Contract</h2>
        <button onClick={() => navigate('/contracts')} className="view-contracts-button">
          View All Contracts
        </button>
      </div>
      <form className="contract-form">
        {templateContent && (
          <div className="template-preview">
            {renderTemplateContent()}
          </div>
        )}
        {!isFinalized && (
          <>
            {signatureVisible && (
              <div className="signature-section">
                <h3>Your Signature:</h3>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: 'signature-canvas' }}
                />
                <div className="button-group">
                  <button type="button" onClick={saveSignature} className="save-button">Save Signature</button>
                  <button type="button" onClick={eraseSignature} className="erase-button">Erase Signature</button>
                </div>
              </div>
            )}
            {signatureVisible && (
              <button type="button" onClick={saveSignatureToBackend} className="submit-button">
                Submit Signature
              </button>
            )}
            {placeholders.get('client_signature') && signatureVisible && (
              <button type="button" onClick={removeSignature} className="remove-button">Remove Signature</button>
            )}
          </>
        )}
      </form>
    </div>
  );
}

export default SignContract;
