import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import '../styles/ContractCreator.css';

function ContractCreator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [placeholders, setPlaceholders] = useState({});
  const [templateContent, setTemplateContent] = useState('');
  const sigCanvas = useRef(null);

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
    setPlaceholders({
      ...placeholders,
      realtor_signature: signatureData
    });
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

    const response = await fetch('https://localhost:5001/api/contracts/fill-template', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateId: selectedTemplate,
        placeholders
      })
    });

    if (response.ok) {
      const data = await response.json();
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
                onChange={(e) => handlePlaceholderChange(e, placeholder)}
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
      <h2>Create Contract</h2>
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
          <button type="button" onClick={saveSignature} className="save-button">Save Signature</button>
        </div>

        <button type="submit" className="submit-button">Generate Contract</button>
      </form>
    </div>
  );
}

export default ContractCreator;
