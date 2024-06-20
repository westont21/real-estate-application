import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate } from 'react-router-dom';
import '../styles/ContractCreator.css';

function ContractCreator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [placeholders, setPlaceholders] = useState({});
  const [templateContent, setTemplateContent] = useState('');
  const [contractId, setContractId] = useState(null);
  const [signatureVisible, setSignatureVisible] = useState(true);
  const [contractGenerated, setContractGenerated] = useState(false);
  const sigCanvas = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTemplates() {
      const response = await fetch('https://localhost:5001/api/contracts/templates', {
        credentials: 'include'
      });
      const data = await response.json();
      setTemplates(data);
    }

    fetchTemplates();
  }, []);

  const handleTemplateChange = (e) => {
    const selected = templates.find((template) => template._id === e.target.value);
    if (!selected) {
      return;
    }
    setSelectedTemplate(selected._id);
    setTemplateContent(selected.content);

    const placeholderRegex = /{{(.*?)}}/g;
    const matches = [...selected.content.matchAll(placeholderRegex)].map(match => match[1]);

    const placeholdersData = {};
    matches.forEach((placeholder) => {
      placeholdersData[placeholder] = '';
    });

    setPlaceholders(placeholdersData);
  };

  const handlePlaceholderChange = (e, placeholder) => {
    setPlaceholders({
      ...placeholders,
      [placeholder]: e.target.value
    });
  };

  const saveSignature = () => {
    const signatureData = sigCanvas.current.toDataURL();
    const signDate = new Date().toLocaleString(); // Capture the current date and time

    setPlaceholders({
      ...placeholders,
      realtor_signature: signatureData,
      realtor_sign_date: signDate // Automatically fill the realtor_sign_date placeholder
    });
  };

  const eraseSignature = () => {
    sigCanvas.current.clear();
  };

  const removeSignature = () => {
    setPlaceholders({
      ...placeholders,
      realtor_signature: '',
      realtor_sign_date: '' // Clear the realtor_sign_date placeholder
    });
    sigCanvas.current.clear();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      alert('Please select a template.');
      return;
    }
    if (!placeholders.realtor_signature) {
      alert('Please add your signature.');
      return;
    }

    console.log(placeholders); // Add this line to debug placeholder values before submission

    const response = await fetch('https://localhost:5001/api/contracts/fill-template', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateId: selectedTemplate,
        placeholders,
        signature: placeholders.realtor_signature
      })
    });

    if (response.ok) {
      const data = await response.json();
      setContractId(data.contract._id);
      setSignatureVisible(false);
      setContractGenerated(true);
      alert(data.message);
    } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
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
              <span className="signature-placeholder">
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
                onChange={(e) => handlePlaceholderChange(e, placeholder)}
                readOnly={placeholder.includes('sign_date')} // Make the sign_date placeholders read-only
              />
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="contract-creator-container">
      <div className="header">
        <h2>Contract Creator</h2>
        <button onClick={() => navigate('/contracts')} className="view-contracts-button">
          View All Contracts
        </button>
      </div>
      <form onSubmit={handleSubmit} className="contract-form">
        <label>
          Template:
          <select onChange={handleTemplateChange} value={selectedTemplate}>
            <option value=''>-- Select a Template --</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>{template.name}</option>
            ))}
          </select>
        </label>

        {templateContent && (
          <>
            <div className="template-preview">
              {renderTemplateContent()}
            </div>

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

            {!contractGenerated && (
              <button type="submit" className="submit-button">Generate Contract</button>
            )}
            {placeholders.realtor_signature && !contractGenerated && (
              <button type="button" onClick={removeSignature} className="remove-button">Remove Signature</button>
            )}
          </>
        )}
      </form>
      {contractId && (
        <button onClick={() => navigate(`/share-contract/${contractId}`)} className="share-button">
          Share Contract
        </button>
      )}
    </div>
  );
}

export default ContractCreator;
