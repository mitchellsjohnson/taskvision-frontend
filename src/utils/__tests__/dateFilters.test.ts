import { getDateFilterRanges, getDateFilterLabel } from '../dateFilters';
import { vi } from "vitest";
import { DateFilterOption } from '../../components/DateFilter';

// Mock Date to ensure consistent test results
const mockDate = new Date('2024-01-15T12:00:00Z'); // Monday, January 15, 2024

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getDateFilterRanges', () => {
  it('returns null for "all" filter', () => {
    const result = getDateFilterRanges('all');
    expect(result).toBeNull();
  });

  it('returns correct range for "pastDue" filter', () => {
    const result = getDateFilterRanges('pastDue');
    expect(result).toEqual({
      endDate: '2024-01-15' // Today (for < comparison)
    });
  });

  it('returns correct range for "dueToday" filter', () => {
    const result = getDateFilterRanges('dueToday');
    expect(result).toEqual({
      startDate: '2024-01-15',
      endDate: '2024-01-15'
    });
  });

  it('returns correct range for "dueThisWeek" filter', () => {
    // January 15, 2024 is a Monday
    // Week should be Sunday Jan 14 to Saturday Jan 20
    const result = getDateFilterRanges('dueThisWeek');
    expect(result).toEqual({
      startDate: '2024-01-14', // Sunday
      endDate: '2024-01-20'    // Saturday
    });
  });

  it('returns correct range for "dueThisMonth" filter', () => {
    const result = getDateFilterRanges('dueThisMonth');
    expect(result).toEqual({
      startDate: '2024-01-01', // First day of January
      endDate: '2024-01-31'    // Last day of January
    });
  });

  it('handles edge case for week calculation when day is Sunday', () => {
    // Mock Sunday, January 14, 2024
    const sundayMock = new Date('2024-01-14T12:00:00Z');
    vi.setSystemTime(sundayMock);
    
    const result = getDateFilterRanges('dueThisWeek');
    expect(result).toEqual({
      startDate: '2024-01-14', // Same Sunday
      endDate: '2024-01-20'    // Following Saturday
    });
  });

  it('handles edge case for month calculation at end of month', () => {
    // Mock January 31, 2024
    const endOfMonthMock = new Date('2024-01-31T12:00:00Z');
    vi.setSystemTime(endOfMonthMock);
    
    const result = getDateFilterRanges('dueThisMonth');
    expect(result).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
  });

  it('handles February leap year correctly', () => {
    // Mock February 15, 2024 (leap year)
    const leapYearMock = new Date('2024-02-15T12:00:00Z');
    vi.setSystemTime(leapYearMock);
    
    const result = getDateFilterRanges('dueThisMonth');
    expect(result).toEqual({
      startDate: '2024-02-01',
      endDate: '2024-02-29' // Leap year has 29 days
    });
  });

  it('returns correct range for "noDueDate" filter', () => {
    const result = getDateFilterRanges('noDueDate');
    expect(result).toEqual({
      noDueDate: true
    });
  });
});

describe('getDateFilterLabel', () => {
  it('returns correct labels for all filter options', () => {
    const testCases: Array<[DateFilterOption, string]> = [
      ['all', 'All'],
      ['pastDue', 'Past Due'],
      ['dueToday', 'Due Today'],
      ['dueThisWeek', 'Due this Week'],
      ['dueThisMonth', 'Due this Month'],
      ['noDueDate', 'No Due Date']
    ];

    testCases.forEach(([option, expectedLabel]) => {
      expect(getDateFilterLabel(option)).toBe(expectedLabel);
    });
  });

  it('returns "All" for invalid option', () => {
    // @ts-ignore - Testing invalid input
    expect(getDateFilterLabel('invalid' as DateFilterOption)).toBe('All');
  });
}); 