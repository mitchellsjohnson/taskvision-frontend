import { TASK_LIMITS, validateTaskField } from '../validation';

describe('validation constants and functions', () => {
  describe('TASK_LIMITS', () => {
    it('should have correct limit values', () => {
      expect(TASK_LIMITS.TITLE_MAX_LENGTH).toBe(200);
      expect(TASK_LIMITS.DESCRIPTION_MAX_LENGTH).toBe(5000);
      expect(TASK_LIMITS.DESCRIPTION_PREVIEW_LENGTH).toBe(300);
      expect(TASK_LIMITS.DESCRIPTION_PREVIEW_LINES).toBe(3);
      expect(TASK_LIMITS.DESCRIPTION_PREVIEW_LINES_MOBILE).toBe(2);
    });
  });

  describe('validateTaskField', () => {
    describe('title validation', () => {
      it('should validate short title as valid', () => {
        const result = validateTaskField('title', 'Short title');
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(false);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(11);
        expect(result.max).toBe(200);
        expect(result.remaining).toBe(189);
      });

      it('should validate title near limit', () => {
        const nearLimitTitle = 'x'.repeat(185); // 92.5% of 200
        const result = validateTaskField('title', nearLimitTitle);
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(185);
        expect(result.remaining).toBe(15);
      });

      it('should validate title at exact limit', () => {
        const exactLimitTitle = 'x'.repeat(200);
        const result = validateTaskField('title', exactLimitTitle);
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(200);
        expect(result.remaining).toBe(0);
      });

      it('should validate title over limit as invalid', () => {
        const overLimitTitle = 'x'.repeat(250);
        const result = validateTaskField('title', overLimitTitle);
        expect(result.isValid).toBe(false);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(true);
        expect(result.current).toBe(250);
        expect(result.remaining).toBe(-50);
      });
    });

    describe('description validation', () => {
      it('should validate short description as valid', () => {
        const result = validateTaskField('description', 'Short description');
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(false);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(17);
        expect(result.max).toBe(5000);
        expect(result.remaining).toBe(4983);
      });

      it('should validate description near limit', () => {
        const nearLimitDescription = 'x'.repeat(4600); // 92% of 5000
        const result = validateTaskField('description', nearLimitDescription);
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(4600);
        expect(result.remaining).toBe(400);
      });

      it('should validate description at exact limit', () => {
        const exactLimitDescription = 'x'.repeat(5000);
        const result = validateTaskField('description', exactLimitDescription);
        expect(result.isValid).toBe(true);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(false);
        expect(result.current).toBe(5000);
        expect(result.remaining).toBe(0);
      });

      it('should validate description over limit as invalid', () => {
        const overLimitDescription = 'x'.repeat(5500);
        const result = validateTaskField('description', overLimitDescription);
        expect(result.isValid).toBe(false);
        expect(result.isNearLimit).toBe(true);
        expect(result.isOverLimit).toBe(true);
        expect(result.current).toBe(5500);
        expect(result.remaining).toBe(-500);
      });
    });

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        const titleResult = validateTaskField('title', '');
        expect(titleResult.isValid).toBe(true);
        expect(titleResult.current).toBe(0);
        expect(titleResult.remaining).toBe(200);

        const descResult = validateTaskField('description', '');
        expect(descResult.isValid).toBe(true);
        expect(descResult.current).toBe(0);
        expect(descResult.remaining).toBe(5000);
      });

      it('should handle whitespace-only strings', () => {
        const titleResult = validateTaskField('title', '   ');
        expect(titleResult.isValid).toBe(true);
        expect(titleResult.current).toBe(3);
        expect(titleResult.remaining).toBe(197);
      });

      it('should handle unicode characters', () => {
        const unicodeTitle = '🚀✨🎯';
        const result = validateTaskField('title', unicodeTitle);
        expect(result.isValid).toBe(true);
        expect(result.current).toBe(5); // Unicode chars count as more than 1 in JS string length
        expect(result.remaining).toBe(195);
      });
    });
  });
}); 