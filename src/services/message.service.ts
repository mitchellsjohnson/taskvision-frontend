import { AxiosRequestConfig } from 'axios';
import { ApiResponse } from '../models/api-response';
import { callExternalApi } from './external-api.service';

const apiServerUrl = process.env.REACT_APP_API_URL;

export const getPublicResource = async (): Promise<ApiResponse> => {
  const config: AxiosRequestConfig = {
    url: `${apiServerUrl}/api/messages/public`,
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  };

  const { data, error } = (await callExternalApi({ config })) as ApiResponse;

  return {
    data,
    error
  };
};

export const getProtectedResource = async (accessToken: string): Promise<ApiResponse> => {
  const config: AxiosRequestConfig = {
    url: `${apiServerUrl}/api/messages/protected`,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };

  const { data, error } = (await callExternalApi({ config })) as ApiResponse;

  return {
    data,
    error
  };
};

export const getAdminResource = async (accessToken: string): Promise<ApiResponse> => {
  const config: AxiosRequestConfig = {
    url: `${apiServerUrl}/api/messages/admin`,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };

  const { data, error } = (await callExternalApi({ config })) as ApiResponse;

  return {
    data,
    error
  };
};

export const getEcosystemAdminResource = async (accessToken: string): Promise<ApiResponse> => {
  const config: AxiosRequestConfig = {
    url: `${apiServerUrl}/api/messages/ecosystem-admin`,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };

  const { data, error } = (await callExternalApi({ config })) as ApiResponse;

  return {
    data,
    error
  };
};

export const getAdminFeatureResource = async (accessToken: string): Promise<ApiResponse> => {
  const config: AxiosRequestConfig = {
    url: `${apiServerUrl}/api/messages/admin-features`,
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  };

  const { data, error } = (await callExternalApi({ config })) as ApiResponse;

  return {
    data,
    error
  };
};
