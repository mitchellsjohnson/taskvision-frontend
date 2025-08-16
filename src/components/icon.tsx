import React from 'react';
import { icons } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface IconProps extends React.SVGAttributes<SVGElement> {
  name: keyof typeof icons;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 24, ...props }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon with name "${name}" not found.`);
    return null; // Or return a default fallback icon
  }

  return <LucideIcon className={twMerge('inline-block', className)} size={size} {...props} />;
};
