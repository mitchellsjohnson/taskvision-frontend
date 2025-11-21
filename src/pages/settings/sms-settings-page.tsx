/**
 * SMS Settings Page
 *
 * Allows users to configure SMS/text message features for TaskVision
 */

import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { smsSettingsApi, SmsConfig } from '../../services/sms-settings-api';

export const SmsSettingsPage: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [smsConfig, setSmsConfig] = useState<SmsConfig | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // Load SMS settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const config = await smsSettingsApi.getSettings(token);
      setSmsConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSms = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate E.164 format
    if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      setError('Phone number must be in E.164 format (e.g., +15551234567)');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const config = await smsSettingsApi.initializeSms(token, phoneNumber);
      setSmsConfig(config);
      setShowVerification(true);
      setSuccess('SMS initialized! Please verify your phone number.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize SMS');
    } finally {
      setSaving(false);
    }
  };

  const handleSendCode = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      await smsSettingsApi.sendVerificationCode(token);
      setCodeSent(true);
      setSuccess('Verification code sent! Check your phone.');

      // Reset after 60 seconds
      setTimeout(() => setCodeSent(false), 60000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(verificationCode)) {
      setError('Verification code must be 6 digits');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      await smsSettingsApi.verifyPhone(token, verificationCode);
      setSuccess('Phone verified successfully!');
      setShowVerification(false);
      setVerificationCode('');
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code');
    } finally {
      setSaving(false);
    }
  };

  const confirmRegenerateKey = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      await smsSettingsApi.regenerateKey(token);
      setShowRegenerateModal(false);
      setSuccess('SMS key regenerated! Check your new ID below.');
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate key');
    } finally {
      setSaving(false);
    }
  };

  const confirmDisableSms = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      await smsSettingsApi.disableSms(token);
      setSmsConfig(null);
      setPhoneNumber('');
      setShowResetModal(false);
      setSuccess('SMS disabled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable SMS');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotification = async (type: 'dailySummary' | 'taskReminders' | 'mitReminders') => {
    try {
      setError(null);
      const token = await getAccessTokenSilently();
      const currentValue = smsConfig?.enabledNotifications?.[type] || false;
      const updates = { [type]: !currentValue };
      const updatedConfig = await smsSettingsApi.updateNotifications(token, updates);
      setSmsConfig(updatedConfig);
      setSuccess('Notification preferences updated');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications');
    }
  };

  const handleDisableSms = async () => {
    if (!window.confirm('Disable SMS? This will remove your phone number and SMS key.')) return;

    try {
      setSaving(true);
      setError(null);
      const token = await getAccessTokenSilently();
      await smsSettingsApi.disableSms(token);
      setSmsConfig(null);
      setPhoneNumber('');
      setSuccess('SMS disabled successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable SMS');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading SMS settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold text-white mb-2">SMS / Text Messages</h1>
      <p className="text-gray-400 mb-8">
        Manage tasks via SMS. Send commands like "Fix bug" MIT1 ID:1234 to create tasks.
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

      {/* Not Configured */}
      {!smsConfig && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Setup SMS</h2>
          <p className="text-gray-400 mb-6">
            Enter your phone number to enable SMS commands. You'll receive a verification code.
          </p>

          <form onSubmit={handleInitializeSms} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+15551234567"
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be in E.164 format (e.g., +15551234567)
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Setting up...' : 'Setup SMS'}
            </button>
          </form>
        </div>
      )}

      {/* Verification Needed */}
      {smsConfig && !smsConfig.verified && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-400 mb-4">Verify Phone Number</h2>
          <p className="text-gray-300 mb-4">
            Phone: <span className="font-mono text-white">{smsConfig.phoneNumber}</span>
          </p>

          {!showVerification ? (
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerification(true)}
                className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Verify Now
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel / Reset
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleSendCode}
                disabled={saving || codeSent}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {codeSent ? 'Code Sent! (Wait 60s)' : 'Send Verification Code'}
              </button>

              <form onSubmit={handleVerifyCode} className="flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Verifying...' : 'Verify'}
                </button>
              </form>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                Cancel / Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* Configured and Verified */}
      {smsConfig && smsConfig.verified && (
        <div className="space-y-6">
          {/* Phone Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Phone Number</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300">
                  <span className="font-mono text-white text-lg">{smsConfig.phoneNumber}</span>
                  <span className="ml-3 text-green-400">✓ Verified</span>
                </p>
              </div>
              <button
                onClick={handleDisableSms}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Disable SMS
              </button>
            </div>
          </div>

          {/* SMS Key */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your SMS Key (ID)</h2>
            <p className="text-gray-400 mb-4">
              Include this ID in all SMS commands
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-3">
                <span className="font-mono text-2xl text-white">{smsConfig.smsKey}</span>
              </div>
              <button
                onClick={() => setShowRegenerateModal(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                Regenerate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Example: "Fix bug" MIT1 ID:{smsConfig.smsKey}
            </p>
          </div>

          {/* Notifications */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Daily MIT Summary</span>
                <input
                  type="checkbox"
                  checked={smsConfig.enabledNotifications?.dailySummary || false}
                  onChange={() => handleToggleNotification('dailySummary')}
                  className="w-5 h-5"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Task Reminders</span>
                <input
                  type="checkbox"
                  checked={smsConfig.enabledNotifications?.taskReminders || false}
                  onChange={() => handleToggleNotification('taskReminders')}
                  className="w-5 h-5"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">MIT Reminders</span>
                <input
                  type="checkbox"
                  checked={smsConfig.enabledNotifications?.mitReminders || false}
                  onChange={() => handleToggleNotification('mitReminders')}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          {/* SMS Commands Help */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">SMS Commands</h2>
            <div className="space-y-2 text-sm font-mono text-gray-300">
              <p>"Task title" MIT1 12/25/2025 ID:{smsConfig.smsKey} → Create task</p>
              <p>CLOSE a1b2 ID:{smsConfig.smsKey} → Complete task</p>
              <p>EDIT a1b2 "New title" MIT2 ID:{smsConfig.smsKey} → Update task</p>
              <p>LIST MIT ID:{smsConfig.smsKey} → Show MIT tasks</p>
              <p>LIST ALL ID:{smsConfig.smsKey} → Show all tasks</p>
              <p>HELP → Show commands</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Reset SMS Settings?</h3>
            <p className="text-gray-300 mb-6">
              This will remove your phone number and SMS key. You'll need to set up SMS again from scratch.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisableSms}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Resetting...' : 'Reset SMS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Key Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Regenerate SMS Key?</h3>
            <p className="text-gray-300 mb-6">
              This will generate a new SMS key. Your old ID will stop working and you'll need to use the new ID in all future SMS commands.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRegenerateModal(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRegenerateKey}
                disabled={saving}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                {saving ? 'Regenerating...' : 'Regenerate Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
