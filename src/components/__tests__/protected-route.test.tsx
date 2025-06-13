import React from 'react';
import { render, screen } from '@testing-library/react';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ProtectedRoute } from '../protected-route';

jest.mock('@auth0/auth0-react', () => ({
  withAuthenticationRequired: jest.fn()
}));

const mockedWithAuthenticationRequired = withAuthenticationRequired as jest.Mock;

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>;

  beforeEach(() => {
    mockedWithAuthenticationRequired.mockImplementation(component => component);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses withAuthenticationRequired HOC', () => {
    render(<ProtectedRoute component={TestComponent} />);
    expect(mockedWithAuthenticationRequired).toHaveBeenCalled();
  });

  it('passes the component to withAuthenticationRequired', () => {
    render(<ProtectedRoute component={TestComponent} />);
    expect(mockedWithAuthenticationRequired).toHaveBeenCalledWith(TestComponent, expect.any(Object));
  });

  it('provides an onRedirecting component to withAuthenticationRequired', () => {
    render(<ProtectedRoute component={TestComponent} />);
    const options = mockedWithAuthenticationRequired.mock.calls[0][1];
    const { container } = render(options.onRedirecting());
    expect(screen.getByTestId('page-loader')).toBeInTheDocument();
  });
});
