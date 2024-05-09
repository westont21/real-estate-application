import React, { useState, useEffect } from 'react';

function ContractCreator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [placeholders, setPlaceholders] = useState({});
  const [generatedContract, setGeneratedContract] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [templatePreview, setTemplatePreview] = useState('');

  useEffect(() => {
    // Fetch all available templates
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
      // Handle case where no template is selected
      return;
    }
    setSelectedTemplate(selected._id);
    setGeneratedContract(null);
  
    // Extract placeholders to be filled from the template content or defined fields
    const placeholderRegex = /{{(.*?)}}/g;
    const matches = [...selected.content.matchAll(placeholderRegex)].map(match => match[1]);
  
    // Prepare a placeholders object to hold input values
    const placeholdersData = {};
    matches.forEach((placeholder) => {
      placeholdersData[placeholder] = '';
    });
  
    setPlaceholders(placeholdersData);
    updateTemplatePreview(selected.content, placeholdersData);
  };

  const handlePlaceholderChange = (e, placeholder) => {
    setPlaceholders({
      ...placeholders,
      [placeholder]: e.target.value
    });
    updateTemplatePreview(templates.find(template => template._id === selectedTemplate).content, {
      ...placeholders,
      [placeholder]: e.target.value
    });
  };

  const updateTemplatePreview = (content, placeholdersData) => {
    let filledTemplate = content;
    for (const [key, value] of Object.entries(placeholdersData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      filledTemplate = filledTemplate.replace(regex, value);
    }
    setTemplatePreview(filledTemplate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      // Handle case where no template is selected
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
      const { pdfUrl } = await response.json();
      setPdfUrl(pdfUrl); // Assuming pdfUrl is the URL returned by the backend
    } else {
      const data = await response.json();
      alert(`Error: ${data.error}`);
    }
  };
  

  return (
    <div>
      <h2>Create Contract</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Template:
          <select onChange={handleTemplateChange} value={selectedTemplate}>
            <option value=''>-- Select a Template --</option>
            {templates.map((template) => (
              <option key={template._id} value={template._id}>{template.name}</option>
            ))}
          </select>
        </label>

        {templatePreview && (
          <div>
            <h3>Template Preview</h3>
            <pre>{templatePreview}</pre>
          </div>
        )}

        {Object.keys(placeholders).length > 0 && (
          <>
            <h4>Fill in the Placeholder Details</h4>
            {Object.keys(placeholders).map((placeholder) => (
              <label key={placeholder}>
                {placeholder}:
                <input
                  type="text"
                  value={placeholders[placeholder]}
                  onChange={(e) => handlePlaceholderChange(e, placeholder)}
                />
              </label>
            ))}
          </>
        )}

        <button type='submit'>Generate Contract</button>
      </form>

      {pdfUrl && (
        <div>
          <h3>Generated Contract</h3>
          <iframe title="Generated Contract" src={pdfUrl} style={{ width: '100%', height: '500px' }} />
        </div>
      )}
    </div>
  );
}

export default ContractCreator;
