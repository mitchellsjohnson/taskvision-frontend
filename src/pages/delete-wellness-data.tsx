import React, { useState } from 'react';
import { useWellnessApi } from '../services/wellness-api';

const DeleteWellnessDataPage: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [message, setMessage] = useState('');
  const { authenticatedRequest } = useWellnessApi() as any;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE ALL MY WELLNESS DATA') {
      setMessage('Please type the confirmation text exactly as shown.');
      return;
    }

    setIsDeleting(true);
    setMessage('');

    try {
      // Call a special endpoint to delete all wellness data
      await authenticatedRequest('DELETE', 'api/wellness/all-data');
      setMessage('✅ All wellness data has been successfully deleted.');
      setConfirmText('');
    } catch (error) {
      console.error('Failed to delete wellness data:', error);
      setMessage(`❌ Failed to delete wellness data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '2rem auto', 
      padding: '2rem', 
      backgroundColor: '#fef2f2',
      border: '2px solid #fecaca',
      borderRadius: '12px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>⚠️ Delete All Wellness Data</h1>
        <p style={{ color: '#7f1d1d', lineHeight: '1.6' }}>
          This page will permanently delete ALL of your wellness data including:
        </p>
        <ul style={{ color: '#7f1d1d', textAlign: 'left', margin: '1rem 0' }}>
          <li>All practice instances</li>
          <li>All weekly scores</li>
          <li>All wellness settings</li>
          <li>All historical data</li>
        </ul>
        <p style={{ color: '#dc2626', fontWeight: 'bold' }}>
          This action CANNOT be undone!
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: 'bold',
          color: '#7f1d1d'
        }}>
          Type "DELETE ALL MY WELLNESS DATA" to confirm:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE ALL MY WELLNESS DATA"
          disabled={isDeleting}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #fca5a5',
            borderRadius: '8px',
            fontSize: '1rem',
            color: '#000000',
            backgroundColor: '#ffffff'
          }}
        />
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting || confirmText !== 'DELETE ALL MY WELLNESS DATA'}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: isDeleting ? 'not-allowed' : 'pointer',
          opacity: confirmText !== 'DELETE ALL MY WELLNESS DATA' ? 0.5 : 1
        }}
      >
        {isDeleting ? 'Deleting...' : 'DELETE ALL WELLNESS DATA'}
      </button>

      {message && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
          border: `2px solid ${message.includes('✅') ? '#22c55e' : '#fecaca'}`,
          borderRadius: '8px',
          color: message.includes('✅') ? '#166534' : '#dc2626',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a 
          href="/wellness" 
          style={{ 
            color: '#3b82f6', 
            textDecoration: 'underline' 
          }}
        >
          ← Back to Wellness Page
        </a>
      </div>
    </div>
  );
};

export default DeleteWellnessDataPage; 