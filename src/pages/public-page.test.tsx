import React from 'react';
import { vi } from "vitest";
import { render, screen, waitFor } from '@testing-library/react';
import { getPublicResource } from '../services/message.service';
import { PublicPage } from './public-page';

vi.mock('../services/message.service');

const mockedGetPublicResource = getPublicResource as any;

describe('PublicPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page title', async () => {
    mockedGetPublicResource.mockResolvedValue({ data: { text: 'Public message' }, error: null });
    render(<PublicPage />);
    await waitFor(() => {
      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });
  });

  it('should render the public message', async () => {
    const message = { text: 'This is the public message.' };
    mockedGetPublicResource.mockResolvedValue({ data: message, error: null });
    render(<PublicPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('This is the public message.'))).toBeInTheDocument();
    });
  });

  it('should render an error message if the api call fails', async () => {
    const error = { message: 'Error fetching public message.' };
    mockedGetPublicResource.mockResolvedValue({ data: null, error: error });
    render(<PublicPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Error fetching public message.'))).toBeInTheDocument();
    });
  });
}); 