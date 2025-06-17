import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { getAdminResource } from '../services/message.service';
import { AdminPage } from './admin-page';

jest.mock('../services/message.service');

const mockedGetAdminResource = getAdminResource as jest.Mock;

describe('AdminPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page title', async () => {
    mockedGetAdminResource.mockResolvedValue({ data: { text: 'Admin message' }, error: null });
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText('Admin Page')).toBeInTheDocument();
    });
  });

  it('should render the admin message', async () => {
    const message = { text: 'This is the admin message.' };
    mockedGetAdminResource.mockResolvedValue({ data: message, error: null });
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('This is the admin message.'))).toBeInTheDocument();
    });
  });

  it('should render an error message if the api call fails', async () => {
    const error = { message: 'Error fetching admin message.' };
    mockedGetAdminResource.mockResolvedValue({ data: null, error: error });
    render(<AdminPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Error fetching admin message.'))).toBeInTheDocument();
    });
  });
}); 