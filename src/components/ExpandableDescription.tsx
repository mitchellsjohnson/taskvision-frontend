import React, { useState } from 'react';

interface ExpandableDescriptionProps {
  description: string;
  maxPreviewLength?: number;
  maxLines?: number;
  className?: string;
}

export const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({
  description,
  maxPreviewLength = 300,
  maxLines = 3,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!description) return null;
  
  const shouldTruncate = description.length > maxPreviewLength;
  const previewText = shouldTruncate ? description.substring(0, maxPreviewLength) : description;
  
  return (
    <div className={`text-xl leading-relaxed ${className}`}>
      {!expanded ? (
        <div className="relative">
          <div 
            className={`${shouldTruncate ? `line-clamp-${maxLines}` : ''} text-gray-300`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: shouldTruncate ? maxLines : 'unset',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {previewText}
            {shouldTruncate && !previewText.endsWith('...') && '...'}
          </div>
          
          {shouldTruncate && (
            <>
              {/* Gradient fade overlay */}
              <div className="absolute bottom-0 right-0 bg-gradient-to-t from-gray-800 via-gray-800/80 to-transparent h-6 w-full pointer-events-none" />
              
              {/* More button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(true);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm mt-1 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                tabIndex={0}
              >
                ⋯ More
              </button>
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="text-gray-300 bg-gray-800/30 rounded-md p-3 border-l-2 border-blue-500/30">
            <p className="whitespace-pre-wrap">{description}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className="text-blue-400 hover:text-blue-300 text-sm mt-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
            tabIndex={0}
          >
            Less ▲
          </button>
        </div>
      )}
    </div>
  );
}; 