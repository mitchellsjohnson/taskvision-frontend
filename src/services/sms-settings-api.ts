/**
 * SMS Settings API Service
 *
 * Handles all SMS configuration operations for TaskVision
 */

import { callExternalApi } from './external-api.service';

export interface SmsConfig {
  phoneNumber?: string;
  smsKey?: string;
  verified: boolean;
  verificationCodeSentAt?: string;
  enabledNotifications?: {
    dailySummary?: boolean;
    taskReminders?: boolean;
    mitReminders?: boolean;
  };
  preferredTime?: string;
  dailyLimitRemaining?: number;
  lastResetDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SmsSettingsResponse {
  success: boolean;
  data: SmsConfig | null;
  message?: string;
}

export interface SmsKeyResponse {
  success: boolean;
  data: {
    smsKey: string;
  };
  message?: string;
}

export const smsSettingsApi = {
  /**
   * Get current SMS configuration
   */
  getSettings: async (accessToken: string): Promise<SmsConfig | null> => {
    const config = {
      url: '/api/user/sms-settings',
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data as any as SmsSettingsResponse).data;
  },

  /**
   * Initialize SMS with phone number
   */
  initializeSms: async (accessToken: string, phoneNumber: string): Promise<SmsConfig> => {
    const config = {
      url: '/api/user/sms-settings',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      data: { phoneNumber },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data as any as SmsSettingsResponse).data!;
  },

  /**
   * Send verification code to phone
   */
  sendVerificationCode: async (accessToken: string): Promise<void> => {
    const config = {
      url: '/api/user/sms-settings/send-verification',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Verify phone with code
   */
  verifyPhone: async (accessToken: string, code: string): Promise<void> => {
    const config = {
      url: '/api/user/sms-settings/verify',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      data: { code },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Regenerate SMS key
   */
  regenerateKey: async (accessToken: string): Promise<string> => {
    const config = {
      url: '/api/user/sms-settings/regenerate-key',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data as any as SmsKeyResponse).data.smsKey;
  },

  /**
   * Update notification preferences
   */
  updateNotifications: async (
    accessToken: string,
    notifications: {
      dailySummary?: boolean;
      taskReminders?: boolean;
      mitReminders?: boolean;
    }
  ): Promise<SmsConfig> => {
    const config = {
      url: '/api/user/sms-settings/notifications',
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      data: notifications,
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data as any as SmsSettingsResponse).data!;
  },

  /**
   * Update preferred time for daily summaries
   */
  updatePreferredTime: async (accessToken: string, preferredTime: string): Promise<void> => {
    const config = {
      url: '/api/user/sms-settings/preferred-time',
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      data: { preferredTime },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Disable SMS (remove phone and key)
   */
  disableSms: async (accessToken: string): Promise<void> => {
    const config = {
      url: '/api/user/sms-settings',
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
  },
};
