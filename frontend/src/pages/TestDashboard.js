import React, { useState, useEffect } from 'react';

const TestDashboard = () => {
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPIs = async () => {
      try {
        setLoading(true);
        console.log('Testing APIs directly...');

        // Test user impact API
        const impactResponse = await fetch('http://localhost:5000/user_impact?user_id=user1');
        const impactData = await impactResponse.json();
        console.log('Impact API response:', impactData);

        // Test loyalty API  
        const loyaltyResponse = await fetch('http://localhost:5000/get_loyalty?user_id=user1');
        const loyaltyData = await loyaltyResponse.json();
        console.log('Loyalty API response:', loyaltyData);

        setApiData({
          impact: impactData,
          loyalty: loyaltyData
        });

      } catch (err) {
        console.error('Test API error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPIs();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading test data...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Test Results</h2>
      
      <h3>Impact API Data:</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(apiData.impact, null, 2)}
      </pre>
      
      <h3>Loyalty API Data:</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(apiData.loyalty, null, 2)}
      </pre>

      {apiData.impact && apiData.impact.success && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>Processed Data:</h3>
          <p>Food Saved: {apiData.impact.impact?.food_saved_kg || 0} kg</p>
          <p>Money Saved: ${(apiData.impact.impact?.money_saved || 0).toFixed(2)}</p>
          <p>CO2 Reduced: {apiData.impact.impact?.co2_saved_kg || 0} kg</p>
          <p>Loyalty Points: {apiData.loyalty?.loyalty_points || 0}</p>
        </div>
      )}
    </div>
  );
};

export default TestDashboard;
