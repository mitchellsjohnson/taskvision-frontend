import { DateFilterOption } from '../components/DateFilter';

export const getDateFilterRanges = (filterOption: DateFilterOption) => {
  const now = new Date();
  // Create date with local timezone to avoid UTC conversion issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Helper function to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  switch (filterOption) {
    case 'all':
      return null; // No date filtering
      
    case 'pastDue': {
      // Past due: before today (use today as the comparison point)
      return {
        endDate: formatDate(today)
      };
    }
      
    case 'dueToday':
      return {
        startDate: formatDate(today),
        endDate: formatDate(today)
      };
      
    case 'dueThisWeek': {
      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Get end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek)
      };
    }
    
    case 'dueThisMonth': {
      // Get start of month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get end of month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(endOfMonth)
      };
    }
    
    case 'noDueDate':
      // Special case: tasks with no due date
      return { noDueDate: true };
    
    default:
      return null;
  }
};

export const getDateFilterLabel = (filterOption: DateFilterOption): string => {
  switch (filterOption) {
    case 'all':
      return 'All';
    case 'pastDue':
      return 'Past Due';
    case 'dueToday':
      return 'Due Today';
    case 'dueThisWeek':
      return 'Due this Week';
    case 'dueThisMonth':
      return 'Due this Month';
    case 'noDueDate':
      return 'No Due Date';
    default:
      return 'All';
  }
}; 