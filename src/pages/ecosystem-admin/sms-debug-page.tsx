/**
 * SMS Debug Page
 *
 * Development tool for ecosystem-admin users to:
 * - View all mock SMS messages sent by the system
 * - Simulate incoming SMS messages
 * - Test SMS workflows locally without real SMS
 */

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { callExternalApi } from '../../services/external-api.service';

interface MockSmsMessage {
  id: string;
  to: string;
  from: string;
  body: string;
  direction: 'outbound' | 'inbound';
  timestamp: string;
}

export const SmsDebugPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [messages, setMessages] = useState<MockSmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Simulate SMS form
  const [simFrom, setSimFrom] = useState('+15555555555');
  const [simBody, setSimBody] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();

      const config = {
        url: '/api/dev/sms-messages',
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      };

      const response = await callExternalApi({ config });
      if (response.error) {
        throw new Error(response.error.message);
      }

      setMessages((response.data as any).data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleClearMessages = async () => {
    if (!window.confirm('Clear all mock SMS messages?')) return;

    try {
      setError(null);
      const token = await getAccessTokenSilently();

      const config = {
        url: '/api/dev/sms-messages/clear',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      };

      const response = await callExternalApi({ config });
      if (response.error) {
        throw new Error(response.error.message);
      }

      setSuccess('Messages cleared');
      setMessages([]);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear messages');
    }
  };

  const handleSimulateSms = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSimulating(true);
      setError(null);
      const token = await getAccessTokenSilently();

      const config = {
        url: '/api/dev/sms-simulate',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        data: {
          from: simFrom,
          body: simBody,
        },
      };

      const response = await callExternalApi({ config });
      if (response.error) {
        throw new Error(response.error.message);
      }

      setSuccess('SMS simulated successfully!');
      setSimBody('');
      setTimeout(() => setSuccess(null), 2000);

      // Reload messages
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate SMS');
    } finally {
      setSimulating(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-4xl font-bold text-white mb-2">SMS Debug</h1>
      <p className="text-gray-400 mb-8">
        Development tool for testing SMS functionality locally
      </p>

      {/* Alerts */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Simulate Incoming SMS */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Simulate Incoming SMS</h2>
        <p className="text-gray-400 mb-4">
          Send a fake SMS message to test task creation and other SMS commands.
        </p>

        <form onSubmit={handleSimulateSms} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              From (Phone Number)
            </label>
            <input
              type="tel"
              value={simFrom}
              onChange={(e) => setSimFrom(e.target.value)}
              placeholder="+15555555555"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message Body
            </label>
            <textarea
              value={simBody}
              onChange={(e) => setSimBody(e.target.value)}
              placeholder='"Buy groceries" MIT1 12/25/2025 ID:1234'
              rows={4}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "Fix bug" MIT1 ID:1234
            </p>
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulating ? 'Simulating...' : 'Send Fake SMS'}
          </button>
        </form>
      </div>

      {/* Outbound SMS Log */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">SMS Message Log</h2>
          <div className="flex gap-2">
            <button
              onClick={loadMessages}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
            >
              Refresh
            </button>
            <button
              onClick={handleClearMessages}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No SMS messages yet. Send a verification code or simulate an SMS to see messages here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">From</th>
                  <th className="pb-3">To</th>
                  <th className="pb-3">Message</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-300">
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-b border-gray-800">
                    <td className="py-3 text-xs text-gray-500">
                      {formatTimestamp(msg.timestamp)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          msg.direction === 'outbound'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-green-900/30 text-green-400'
                        }`}
                      >
                        {msg.direction === 'outbound' ? '→ Outbound' : '← Inbound'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-xs">{msg.from}</td>
                    <td className="py-3 font-mono text-xs">{msg.to}</td>
                    <td className="py-3 max-w-md truncate">{msg.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
