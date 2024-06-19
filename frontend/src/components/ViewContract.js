import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ViewContract.css';

function ViewContract() {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [templateContent, setTemplateContent] = useState('');
  const [placeholders, setPlaceholders] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchContract = async () => {
    try {
      const response = await fetch(`https://localhost:5001/api/contracts/${contractId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }
      const data = await response.json();
      console.log('Fetched Contract Data:', data);
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
      <h2>View Contract</h2>
      <div className="template-preview">
        {renderTemplateContent()}
      </div>
    </div>
  );
}

export default ViewContract;
