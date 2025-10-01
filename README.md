# TaskVision Frontend

This is the frontend application for TaskVision, built with React and TypeScript.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment files:
   - `.env.dev` for development
   - `.env.prod` for production

3. Start development server:
   ```bash
   npm run start:dev
   ```

## Deployment

The application is automatically deployed to production when changes are pushed to the `main` branch. The deployment process:

1. Builds the application using production environment variables
2. Updates DNS records using Terraform
3. Uploads the build to S3
4. Invalidates the CloudFront cache

## Infrastructure

The infrastructure is managed using Terraform and includes:
- ACM certificate for the domain
- Route53 DNS records
- S3 bucket for static hosting
- CloudFront distribution for content delivery

## Environment Variables

Required environment variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_AUTH0_DOMAIN`: Auth0 domain
- `REACT_APP_AUTH0_CLIENT_ID`: Auth0 client ID
- `REACT_APP_AUTH0_AUDIENCE`: Auth0 audience
- `REACT_APP_AUTH0_CALLBACK_URL`: Auth0 callback URL
- `REACT_APP_CDN`: CDN URL
- `REACT_APP_API_SERVER_URL`: Backend API URL

# TaskVision - Tag System Implementation

## 🎯 New Accessible Tag System

TaskVision now features a completely redesigned tag system that prioritizes accessibility, usability, and semantic clarity. The new system replaces colored backgrounds with semantic icons and subtle borders, making it more accessible and professional.

### ✨ Key Features

#### 🎨 **Accessible Design**
- **WCAG Compliant**: High contrast borders instead of colored backgrounds
- **Semantic Icons**: Heroicons outline icons for visual context
- **Dark Mode Friendly**: Consistent appearance across themes
- **Color Independence**: No reliance on color as the primary information carrier

#### 🔧 **Enhanced Functionality**
- **Smart Autocomplete**: Intelligent suggestions for default tags
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, and Space
- **Click Outside Detection**: Intuitive dropdown behavior
- **Duplicate Prevention**: Automatic filtering of existing tags

#### ♿ **Accessibility Features**
- **Screen Reader Support**: Comprehensive ARIA labels and roles
- **Keyboard Navigation**: Tab, Enter, Space, Arrow keys
- **Focus Indicators**: Clear visual focus states
- **Semantic Markup**: Proper roles (button, listitem, combobox, listbox)

### 🏗️ Architecture

#### **Core Components**

1. **`Tag.tsx`** - Universal tag component
   ```tsx
   interface TagProps {
     label: string;               // Required. e.g., "Leader"
     type: 'default' | 'custom';  // Required. Defines style and icon usage
     onClick?: () => void;        // Optional click handler
     className?: string;          // Optional additional styles
   }
   ```

2. **`TagInput.tsx`** - Input with autocomplete
   - Real-time suggestions for default tags
   - Keyboard navigation (Arrow keys, Enter, Escape)
   - Click-outside handling
   - Accessible combobox pattern

3. **`TagFilterPills.tsx`** - Filter interface
   - Visual selection states
   - Alphabetical sorting
   - Consistent styling with Tag component

#### **Tag Definitions**
```typescript
export const DEFAULT_TAGS: Record<string, DefaultTag> = {
  '5-min':     { icon: ClockIcon,              border: 'border-cyan-400' },
  'Leader':    { icon: UserCircleIcon,         border: 'border-rose-400' },
  'Creative':  { icon: LightBulbIcon,          border: 'border-yellow-400' },
  'Customer':  { icon: UserGroupIcon,          border: 'border-teal-400' },
  'Follow-up': { icon: ArrowPathIcon,          border: 'border-orange-400' },
  'Personal':  { icon: UserIcon,               border: 'border-pink-400' },
  'Research':  { icon: MagnifyingGlassIcon,    border: 'border-purple-400' },
  'Team':      { icon: UsersIcon,              border: 'border-blue-400' },
  'Training':  { icon: AcademicCapIcon,        border: 'border-green-400' },
  'Work':      { icon: BriefcaseIcon,          border: 'border-indigo-400' },
};
```

### 🔄 Migration Notes

#### **Breaking Changes**
- `boss` tag replaced with `Leader` (better semantic meaning)
- Tag styling moved from colored backgrounds to bordered design
- Tag component API updated with new props structure

#### **Backward Compatibility**
- Legacy `RESERVED_TAGS` maintained during transition
- Existing tag data automatically migrated to new system
- Old tag references continue to work

### 🧪 Testing

#### **Test Coverage**
- **Tag Component**: 15 test cases covering accessibility, interactions, and styling
- **TagInput Component**: 20 test cases covering autocomplete, keyboard navigation, and ARIA
- **TagFilterPills Component**: 10 test cases covering selection states and interactions

#### **Accessibility Testing**
- Screen reader compatibility verified
- Keyboard navigation tested
- Focus management validated
- ARIA attributes confirmed

### 🚀 Usage Examples

#### **Basic Tag Usage**
```tsx
// Default tag with icon
<Tag label="Leader" type="default" />

// Custom tag without icon
<Tag label="My Custom Tag" type="custom" />

// Clickable tag
<Tag 
  label="Leader" 
  type="default" 
  onClick={() => handleTagClick('Leader')} 
/>
```

#### **Tag Input with Autocomplete**
```tsx
<TagInput 
  tags={currentTags} 
  onTagsChange={setCurrentTags}
  className="bg-gray-700"
/>
```

#### **Filter Pills**
```tsx
<TagFilterPills
  selectedTags={selectedTags}
  onTagClick={handleTagToggle}
/>
```

### 🎨 Design System

#### **Visual Hierarchy**
- **Default Tags**: Icon + colored border + label
- **Custom Tags**: Neutral border + label (no icon)
- **Selected State**: Ring indicator + full opacity
- **Hover State**: Opacity transition
- **Focus State**: Blue focus ring

#### **Color Palette**
- Cyan: `5-min` (time-based)
- Rose: `Leader` (leadership)
- Yellow: `Creative` (creativity)
- Teal: `Customer` (external)
- Orange: `Follow-up` (action)
- Pink: `Personal` (individual)
- Purple: `Research` (investigation)
- Blue: `Team` (collaboration)
- Green: `Training` (learning)
- Indigo: `Work` (professional)

### 📊 Performance

#### **Optimizations**
- Efficient tag filtering with Set operations
- Debounced autocomplete suggestions
- Minimal re-renders with proper dependency arrays
- Icon components loaded only when needed

#### **Bundle Impact**
- Heroicons: ~2KB additional (tree-shaken)
- New components: ~3KB total
- Net improvement due to simplified styling logic

### 🔮 Future Enhancements

#### **Planned Features**
- Tag categories and grouping
- Custom icon support for user-defined tags
- Tag usage analytics
- Bulk tag operations
- Tag templates and presets

#### **Accessibility Roadmap**
- High contrast mode support
- Reduced motion preferences
- Voice control compatibility
- Multi-language icon descriptions

---

*This tag system represents a significant step forward in making TaskVision more accessible, usable, and professional while maintaining the powerful organizational features users expect.*

## Recent Enhancements

### TVAgent Enhancements
- **Multiple Task Creation**: Added `create_multiple_tasks` function for batch task creation from single input.
- **Enhanced Response Formatting**: Improved task list formatting with MIT/LIT sections and readable status indicators.
- **Wellness Integration**: Integrated wellness suggestions into task responses.

### Dashboard Improvements
- **Tab System**: Replaced dashboard with tab navigation between "Dashboard" and "Wellness".
- **New API Endpoints**: Added endpoints for productivity score, recent activity, and upcoming tasks.
- **Primary Dashboard Layout**: Implemented core widgets with responsive design and error handling.

### Backend and API Enhancements
- **Task Management APIs**: Full CRUD operations with validation and filtering.
- **Audit Logging**: Enhanced logging for task status changes and priority updates.

### Development and Deployment
- **Infrastructure**: Continued use of AWS services and Terraform.
- **CI/CD**: Integration with AWS CodePipeline for automated testing and deployment.
