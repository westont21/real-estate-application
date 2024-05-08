// ContractCreator.js
import React, { useState } from 'react';
import '../styles/ContractCreator.css';

function ContractCreator() {
    const [commissionRate, setCommissionRate] = useState('');
    const [propertyDetails, setPropertyDetails] = useState('');
    const [completionDate, setCompletionDate] = useState('');
    const [additionalClauses, setAdditionalClauses] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);

    const fetchAiSuggestions = async () => {
        try {
            const response = await fetch('https://localhost:5001/api/contracts/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commissionRate,
                    propertyDetails,
                    completionDate,
                    additionalClauses: additionalClauses.split('\n')
                }),
                credentials: 'include',
            });

            const data = await response.json();
            if (data.success) {
                setAiSuggestions(data.suggestions);
            } else {
                alert('Failed to fetch AI suggestions.');
            }
        } catch (error) {
            console.error('Error fetching AI suggestions:', error);
            alert('Error fetching AI suggestions.');
        }
    };

    const handleGenerateContract = (event) => {
        event.preventDefault();
        fetchAiSuggestions();
    };

    return (
        <div className="contract-creator-container">
            <h1>Create Contract</h1>
            <form onSubmit={handleGenerateContract}>
                <label>Commission Rate (%):</label>
                <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                />

                <label>Property Details:</label>
                <textarea
                    value={propertyDetails}
                    onChange={(e) => setPropertyDetails(e.target.value)}
                />

                <label>Completion Date:</label>
                <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                />

                <label>Additional Clauses (separate by new lines):</label>
                <textarea
                    value={additionalClauses}
                    onChange={(e) => setAdditionalClauses(e.target.value)}
                />

                <button type="submit">Generate Contract</button>
            </form>

            {aiSuggestions.length > 0 && (
                <div className="ai-suggestions">
                    <h2>AI Contract Suggestions</h2>
                    <ul>
                        {aiSuggestions.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ContractCreator;
