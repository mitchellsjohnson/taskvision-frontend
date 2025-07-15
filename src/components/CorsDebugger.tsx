import React, { useState } from 'react';

interface CorsDebuggerProps {
  apiUrl?: string;
}

export const CorsDebugger: React.FC<CorsDebuggerProps> = ({ 
  apiUrl = process.env.REACT_APP_API_SERVER_URL || 'https://api.taskvision.ai' 
}) => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testCorsConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing CORS connection...');

    try {
      // Test basic connectivity
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestResult('✅ CORS connection successful! API server is accessible.');
      } else {
        setTestResult(`⚠️ API responded with status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setTestResult(`❌ CORS Error: Cannot connect to ${apiUrl}. 
        
Possible solutions:
1. Configure CORS headers on the API server
2. Use a proxy during development
3. Check if the API server is running
4. Verify the API URL is correct`);
      } else {
        setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testEnvironment = () => {
    const info = {
      'Current Environment': process.env.NODE_ENV || 'unknown',
      'API Server URL': apiUrl,
      'Current Origin': window.location.origin,
      'User Agent': navigator.userAgent.substring(0, 50) + '...',
    };

    setTestResult(`Environment Information:
${Object.entries(info).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>CORS Debugger</h3>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testCorsConnection} 
          disabled={isLoading}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          {isLoading ? 'Testing...' : 'Test CORS Connection'}
        </button>
        <button 
          onClick={testEnvironment}
          style={{ padding: '8px 16px' }}
        >
          Show Environment Info
        </button>
      </div>
      {testResult && (
        <pre style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ddd',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          {testResult}
        </pre>
      )}
    </div>
  );
};
