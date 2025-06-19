import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateFilter, DateFilterOption } from '../DateFilter';

const mockOnSelectionChange = jest.fn();

describe('DateFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default title and selected option', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    expect(screen.getByText('Due Date: All')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
        title="Custom Date Filter"
      />
    );
    expect(screen.getByText('Custom Date Filter: All')).toBeInTheDocument();
  });

  it('opens the dropdown on button click', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    const button = screen.getByText('Due Date: All');
    fireEvent.click(button);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Past Due')).toBeInTheDocument();
    expect(screen.getByText('Due Today')).toBeInTheDocument();
    expect(screen.getByText('Due this Week')).toBeInTheDocument();
    expect(screen.getByText('Due this Month')).toBeInTheDocument();
    expect(screen.getByText('No Due Date')).toBeInTheDocument();
  });

  it('calls onSelectionChange when an option is clicked', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    fireEvent.click(screen.getByText('Due Date: All')); // Open dropdown
    fireEvent.click(screen.getByText('Past Due'));
    
    expect(mockOnSelectionChange).toHaveBeenCalledWith('pastDue');
  });

  it('closes the dropdown after selecting an option', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const button = screen.getByText('Due Date: All');
    fireEvent.click(button); // Open dropdown
    
    // Verify dropdown is open by checking for Past Due option
    expect(screen.getByText('Past Due')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Past Due'));
    
    // After clicking an option, dropdown should close (only button text remains)
    expect(screen.queryByText('Past Due')).not.toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    render(
      <DateFilter
        selectedOption="dueToday"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    expect(screen.getByText('Due Date: Due Today')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Due Date: Due Today')); // Open dropdown
    
    // Find the "Due Today" option button in the dropdown
    const dueTodayOption = screen.getAllByText('Due Today').find(element => 
      element.tagName === 'BUTTON' && element.closest('.bg-blue-600')
    );
    expect(dueTodayOption).toBeInTheDocument();
  });

  it('closes the dropdown when clicking outside', () => {
    render(
      <div>
        <DateFilter
          selectedOption="all"
          onSelectionChange={mockOnSelectionChange}
        />
        <div data-testid="outside-element">Outside</div>
      </div>
    );
    
    const button = screen.getByText('Due Date: All');
    fireEvent.click(button); // Open dropdown
    
    // Verify dropdown is open
    expect(screen.getByText('Past Due')).toBeInTheDocument();
    
    fireEvent.mouseDown(screen.getByTestId('outside-element')); // Click outside
    
    // Verify dropdown is closed
    expect(screen.queryByText('Past Due')).not.toBeInTheDocument();
  });

  it('displays correct labels for all filter options', () => {
    const options: DateFilterOption[] = ['all', 'pastDue', 'dueToday', 'dueThisWeek', 'dueThisMonth'];
    const expectedLabels = ['All', 'Past Due', 'Due Today', 'Due this Week', 'Due this Month'];
    
    options.forEach((option, index) => {
      const { rerender } = render(
        <DateFilter
          selectedOption={option}
          onSelectionChange={mockOnSelectionChange}
        />
      );
      
      expect(screen.getByText(`Due Date: ${expectedLabels[index]}`)).toBeInTheDocument();
      
      // Clean up for next iteration
      rerender(<div />);
    });
  });

  it('toggles dropdown visibility with multiple clicks', () => {
    render(
      <DateFilter
        selectedOption="all"
        onSelectionChange={mockOnSelectionChange}
      />
    );
    
    const button = screen.getByText('Due Date: All');
    
    // Initially closed
    expect(screen.queryByText('Past Due')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(button);
    expect(screen.getByText('Past Due')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(button);
    expect(screen.queryByText('Past Due')).not.toBeInTheDocument();
  });
}); 