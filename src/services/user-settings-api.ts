import { callExternalApi } from './external-api.service';

export interface UserSettings {
  userId: string;
  theme: 'system' | 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large' | 'extra-extra-large';
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    alwaysShowFocus: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsUpdate {
  theme?: 'system' | 'light' | 'dark';
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large' | 'extra-extra-large';
  accessibility?: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    alwaysShowFocus?: boolean;
  };
}

export interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
}

export const userSettingsApi = {
  /**
   * Get current user settings
   */
  getSettings: async (accessToken: string): Promise<UserSettings> => {
    const config = {
      url: '/api/user/settings',
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
    return (response.data as any).data as UserSettings;
  },

  /**
   * Update user settings
   */
  updateSettings: async (
    accessToken: string,
    updates: UserSettingsUpdate
  ): Promise<UserSettings> => {
    const config = {
      url: '/api/user/settings',
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
      data: updates,
    };

    const response = await callExternalApi({ config });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return (response.data as any).data as UserSettings;
  },
};
