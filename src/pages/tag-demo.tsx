import React, { useState } from 'react';
import { Tag } from '../components/Tag';
import { TagInput } from '../components/TagInput';
import { TagFilterPills } from '../components/TagFilterPills';
import { DEFAULT_TAGS } from '../constants/tags';

export const TagDemo: React.FC = () => {
  const [inputTags, setInputTags] = useState<string[]>(['Leader', 'Work']);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>(['Creative']);

  const handleFilterTagClick = (tag: string) => {
    setSelectedFilterTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Tag System Demo</h1>
      
      <div className="space-y-8">
        {/* Individual Tag Examples */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Individual Tags</h2>
          <div className="flex flex-wrap gap-4">
            <h3 className="w-full text-lg">Default Tags:</h3>
            {Object.keys(DEFAULT_TAGS).map(tagName => (
              <Tag key={tagName} label={tagName} type="default" />
            ))}
            
            <h3 className="w-full text-lg mt-4">Custom Tags:</h3>
            <Tag label="Custom Tag 1" type="custom" />
            <Tag label="Custom Tag 2" type="custom" />
            
            <h3 className="w-full text-lg mt-4">Clickable Tags:</h3>
            <Tag 
              label="Clickable Default" 
              type="default" 
              onClick={() => alert('Default tag clicked!')} 
            />
            <Tag 
              label="Clickable Custom" 
              type="custom" 
              onClick={() => alert('Custom tag clicked!')} 
            />
          </div>
        </section>

        {/* Tag Input */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Tag Input with Autocomplete</h2>
          <div className="max-w-md">
            <TagInput 
              tags={inputTags} 
              onTagsChange={setInputTags}
              className="bg-gray-700"
            />
            <p className="mt-2 text-sm text-gray-400">
              Current tags: {inputTags.join(', ') || 'None'}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Try typing: "cr", "team", "5", "leader", etc.
            </p>
          </div>
        </section>

        {/* Tag Filter Pills */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Tag Filter Pills</h2>
          <TagFilterPills
            selectedTags={selectedFilterTags}
            onTagClick={handleFilterTagClick}
          />
          <p className="mt-2 text-sm text-gray-400">
            Selected filters: {selectedFilterTags.join(', ') || 'None'}
          </p>
        </section>

        {/* Accessibility Info */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Accessibility Features</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <ul className="space-y-2 text-sm">
              <li>✅ All tags have proper ARIA labels</li>
              <li>✅ Keyboard navigation with Tab, Enter, Space</li>
              <li>✅ Screen reader compatible</li>
              <li>✅ Focus indicators and hover states</li>
              <li>✅ Semantic icons for default tags</li>
              <li>✅ High contrast borders instead of color backgrounds</li>
              <li>✅ Autocomplete with arrow key navigation</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}; 