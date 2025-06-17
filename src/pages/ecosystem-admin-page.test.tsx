import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { getEcosystemAdminResource } from '../services/message.service';
import { EcosystemAdminPage } from './ecosystem-admin-page';

jest.mock('../services/message.service');

const mockedGetEcosystemAdminResource = getEcosystemAdminResource as jest.Mock;

describe('EcosystemAdminPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page title', async () => {
    mockedGetEcosystemAdminResource.mockResolvedValue({ data: { text: 'Ecosystem admin message' }, error: null });
    render(<EcosystemAdminPage />);
    await waitFor(() => {
      expect(screen.getByText('Ecosystem Admin Page')).toBeInTheDocument();
    });
  });

  it('should render the ecosystem admin message', async () => {
    const message = { text: 'This is the ecosystem admin message.' };
    mockedGetEcosystemAdminResource.mockResolvedValue({ data: message, error: null });
    render(<EcosystemAdminPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('This is the ecosystem admin message.'))).toBeInTheDocument();
    });
  });

  it('should render an error message if the api call fails', async () => {
    const error = { message: 'Error fetching ecosystem admin message.' };
    mockedGetEcosystemAdminResource.mockResolvedValue({ data: null, error: error });
    render(<EcosystemAdminPage />);
    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes('Error fetching ecosystem admin message.'))).toBeInTheDocument();
    });
  });
}); 