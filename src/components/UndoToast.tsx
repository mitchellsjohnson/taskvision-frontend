import React, { useEffect } from 'react';
import { Icon } from './icon';
import { UndoAction } from '../hooks/useUndo';

interface UndoToastProps {
  action: UndoAction;
  onUndo: () => void;
  onDismiss: () => void;
  isUndoing?: boolean;
}

export const UndoToast: React.FC<UndoToastProps> = ({ 
  action, 
  onUndo, 
  onDismiss, 
  isUndoing = false 
}) => {
  useEffect(() => {
    // Auto dismiss after 8 seconds if not interacted with
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Success Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Icon name="Check" className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {action.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Action completed successfully
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onUndo}
            disabled={isUndoing}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Undo: ${action.description}`}
          >
            {isUndoing ? (
              <>
                <Icon name="LoaderCircle" className="w-3 h-3 animate-spin" />
                Undoing...
              </>
            ) : (
              <>
                <Icon name="Undo" className="w-3 h-3" />
                Undo
              </>
            )}
          </button>
          
          <button
            onClick={onDismiss}
            disabled={isUndoing}
            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Dismiss notification"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-muted rounded-full h-1">
        <div 
          className="bg-primary h-1 rounded-full animate-progress-shrink"
        />
      </div>
    </div>
  );
};
