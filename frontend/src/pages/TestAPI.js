import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const TestAPIPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = [];

    // Test 1: Health Check
    try {
      const health = await apiService.healthCheck();
      results.push({
        test: 'Health Check',
        status: 'SUCCESS',
        data: JSON.stringify(health, null, 2)
      });
    } catch (error) {
      results.push({
        test: 'Health Check',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 2: Get Inventory
    try {
      const inventory = await apiService.getInventory();
      results.push({
        test: 'Get Inventory',
        status: 'SUCCESS',
        data: `Found ${inventory.inventory?.length || 0} items. Sample: ${JSON.stringify(inventory.inventory?.slice(0, 2), null, 2) || 'None'}`
      });
    } catch (error) {
      results.push({
        test: 'Get Inventory',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 3: Get Cart
    try {
      const cart = await apiService.getCart('user1');
      results.push({
        test: 'Get Cart',
        status: 'SUCCESS',
        data: `Found ${cart.items?.length || cart.cart?.length || 0} items in cart. Data: ${JSON.stringify(cart, null, 2)}`
      });
    } catch (error) {
      results.push({
        test: 'Get Cart',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 4: Get Alerts
    try {
      const alerts = await apiService.getAlerts('user1');
      results.push({
        test: 'Get Alerts',
        status: 'SUCCESS',
        data: `Found ${alerts.alerts?.length || 0} alerts. Sample: ${JSON.stringify(alerts.alerts?.slice(0, 2), null, 2) || 'None'}`
      });
    } catch (error) {
      results.push({
        test: 'Get Alerts',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 5: Get Loyalty Points
    try {
      const loyalty = await apiService.getLoyaltyPoints('user1');
      results.push({
        test: 'Get Loyalty Points',
        status: 'SUCCESS',
        data: `Points: ${loyalty.points || 0}. Data: ${JSON.stringify(loyalty, null, 2)}`
      });
    } catch (error) {
      results.push({
        test: 'Get Loyalty Points',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 6: Add to Cart Test
    try {
      const addResult = await apiService.addToCart('user1', 'Bananas', 2);
      results.push({
        test: 'Add to Cart (Bananas)',
        status: 'SUCCESS',
        data: `Result: ${JSON.stringify(addResult, null, 2)}`
      });
    } catch (error) {
      results.push({
        test: 'Add to Cart (Bananas)',
        status: 'ERROR',
        error: error.message
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="container py-8">
      <div className="card">
        <div className="card-header">
          <h2>API Test Results</h2>
          <button onClick={runTests} disabled={loading} className="btn btn-primary">
            {loading ? 'Running Tests...' : 'Run Tests'}
          </button>
        </div>
        <div className="card-body">
          {testResults.length === 0 ? (
            <p>No test results yet...</p>
          ) : (
            <div className="test-results">
              {testResults.map((result, index) => (
                <div key={index} className={`test-result ${result.status.toLowerCase()}`}>
                  <div className="test-info">
                    <h4>{result.test}</h4>
                    <span className={`status ${result.status.toLowerCase()}`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="test-data">
                    {result.data && (
                      <div>
                        <strong>Data:</strong>
                        <pre style={{ 
                          background: '#f8f9fa', 
                          padding: '8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          maxHeight: '200px',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {result.data}
                        </pre>
                      </div>
                    )}
                    {result.error && (
                      <div>
                        <strong>Error:</strong>
                        <pre style={{ 
                          background: '#f8d7da', 
                          padding: '8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#721c24',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestAPIPage;
