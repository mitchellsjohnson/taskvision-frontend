export const TASK_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  DESCRIPTION_PREVIEW_LENGTH: 300,
  DESCRIPTION_PREVIEW_LINES: 3,
  DESCRIPTION_PREVIEW_LINES_MOBILE: 2,
} as const;

export const validateTaskField = (field: 'title' | 'description', value: string) => {
  const maxLength = field === 'title' ? TASK_LIMITS.TITLE_MAX_LENGTH : TASK_LIMITS.DESCRIPTION_MAX_LENGTH;
  
  return {
    isValid: value.length <= maxLength,
    isNearLimit: value.length > maxLength * 0.9,
    isOverLimit: value.length > maxLength,
    remaining: maxLength - value.length,
    current: value.length,
    max: maxLength,
  };
}; 