import { icons } from 'lucide-react';

export interface DefaultTag {
  border: string;
}

export const DEFAULT_TAGS: Record<string, DefaultTag> = {
  '5-min': { border: 'border-cyan-400' },
  'Leader': { border: 'border-rose-400' },
  'Creative': { border: 'border-yellow-400' },
  'Customer': { border: 'border-teal-400' },
  'Follow-up': { border: 'border-orange-400' },
  'Personal': { border: 'border-pink-400' },
  'Research': { border: 'border-purple-400' },
  'Team': { border: 'border-blue-400' },
  'Training': { border: 'border-green-400' },
  'Work': { border: 'border-indigo-400' },
  'Gratitude': { border: 'border-red-400' },
  'Wellness': { border: 'border-emerald-400' },
};

export const TAG_ICON_MAP: Record<string, keyof typeof icons> = {
  '5-min': 'Zap',
  Leader: 'UserCog',
  Creative: 'Lightbulb',
  Customer: 'Users',
  'Follow-up': 'ArrowRight',
  Personal: 'User',
  Research: 'Search',
  Team: 'Users',
  Training: 'BookOpen',
  Work: 'Briefcase',
  Gratitude: 'Heart',
  Wellness: 'Sparkles',
  default: 'Tag',
};

// Legacy interface for backward compatibility during migration
export interface ReservedTag {
  name: string;
  color: string;
  bg: string;
  text: string;
}

// Legacy RESERVED_TAGS for backward compatibility - will be removed after migration
export const RESERVED_TAGS: ReservedTag[] = [
  {
    "name": "personal",
    "color": "sky",
    "bg": "bg-sky-500",
    "text": "text-sky-100"
  },
  {
    "name": "boss",
    "color": "purple",
    "bg": "bg-purple-500",
    "text": "text-purple-100"
  },
  {
    "name": "customer",
    "color": "blue",
    "bg": "bg-blue-500",
    "text": "text-blue-100"
  },
  {
    "name": "team",
    "color": "cyan",
    "bg": "bg-cyan-500",
    "text": "text-cyan-100"
  },
  {
    "name": "follow-up",
    "color": "amber",
    "bg": "bg-amber-500",
    "text": "text-amber-100"
  },
  {
    "name": "5-min",
    "color": "yellow",
    "bg": "bg-yellow-500",
    "text": "text-yellow-100"
  },
  {
    "name": "research",
    "color": "indigo",
    "bg": "bg-indigo-500",
    "text": "text-indigo-100"
  },
  {
    "name": "training",
    "color": "green",
    "bg": "bg-green-500",
    "text": "text-green-100"
  },
  {
    "name": "creative",
    "color": "pink",
    "bg": "bg-pink-500",
    "text": "text-pink-100"
  }
];

export const getTagStyles = (tagName: string): { bg: string; text: string } => {
  const tag = RESERVED_TAGS.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  if (tag) {
    return { bg: tag.bg, text: tag.text };
  }
  // Default color for non-reserved tags
  return { bg: 'bg-gray-500', text: 'text-gray-100' };
}; 