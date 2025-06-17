import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { getProtectedResource } from '../services/message.service';
import { ProtectedPage } from './protected-page';

jest.mock('../services/message.service');

const mockedGetProtectedResource = getProtectedResource as jest.Mock;

describe('ProtectedPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page title', async () => {
    mockedGetProtectedResource.mockResolvedValue({ data: { text: 'Protected message' }, error: null });
    render(<ProtectedPage />);
    await waitFor(() => {
      expect(screen.getByText('Protected Page')).toBeInTheDocument();
    });
  });

  it('should render the protected message', async () => {
    const message = { text: 'This is the protected message.' };
    mockedGetProtectedResource.mockResolvedValue({ data: message, error: null });
    render(<ProtectedPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('This is the protected message.'))).toBeInTheDocument();
    });
  });

  it('should render an error message if the api call fails', async () => {
    const error = { message: 'Error fetching protected message.' };
    mockedGetProtectedResource.mockResolvedValue({ data: null, error: error });
    render(<ProtectedPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Error fetching protected message.'))).toBeInTheDocument();
    });
  });
}); 