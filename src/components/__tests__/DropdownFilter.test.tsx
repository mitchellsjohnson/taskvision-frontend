import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropdownFilter } from '../DropdownFilter';

const options = ['Open', 'Waiting', 'Completed'] as const;
type Status = (typeof options)[number];

const mockOnSelectionChange = jest.fn();

describe('DropdownFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title', () => {
    render(
      <DropdownFilter<Status>
        options={options}
        selectedOptions={[]}
        onSelectionChange={mockOnSelectionChange}
        title="Filter by Status"
      />
    );
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  it('opens the dropdown on button click', () => {
    render(
      <DropdownFilter<Status>
        options={options}
        selectedOptions={[]}
        onSelectionChange={mockOnSelectionChange}
        title="Filter by Status"
      />
    );
    const button = screen.getByText('Filter by Status');
    fireEvent.click(button);
    expect(screen.getByLabelText('Open')).toBeInTheDocument();
    expect(screen.getByLabelText('Waiting')).toBeInTheDocument();
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('calls onSelectionChange when an option is clicked', () => {
    render(
      <DropdownFilter<Status>
        options={options}
        selectedOptions={[]}
        onSelectionChange={mockOnSelectionChange}
        title="Filter by Status"
      />
    );
    fireEvent.click(screen.getByText('Filter by Status')); // Open dropdown
    const openCheckbox = screen.getByLabelText('Open');
    fireEvent.click(openCheckbox);
    expect(mockOnSelectionChange).toHaveBeenCalledWith('Open');
  });

  it('correctly checks the selected options', () => {
    render(
      <DropdownFilter<Status>
        options={options}
        selectedOptions={['Open']}
        onSelectionChange={mockOnSelectionChange}
        title="Filter by Status"
      />
    );
    fireEvent.click(screen.getByText('Filter by Status')); // Open dropdown
    expect(screen.getByLabelText('Open')).toBeChecked();
    expect(screen.getByLabelText('Waiting')).not.toBeChecked();
  });

  it('closes the dropdown when clicking outside', () => {
    render(
      <div>
        <DropdownFilter<Status>
          options={options}
          selectedOptions={[]}
          onSelectionChange={mockOnSelectionChange}
          title="Filter by Status"
        />
        <div data-testid="outside-element">Outside</div>
      </div>
    );
    const button = screen.getByText('Filter by Status');
    fireEvent.click(button); // Open dropdown
    expect(screen.getByLabelText('Open')).toBeInTheDocument(); // Ensure it's open

    fireEvent.mouseDown(screen.getByTestId('outside-element')); // Click outside
    expect(screen.queryByLabelText('Open')).not.toBeInTheDocument(); // Ensure it's closed
  });
}); 