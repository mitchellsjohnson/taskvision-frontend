import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { RadioGroup, RadioGroupItem } from '../components/ui/RadioGroup';
import { Switch } from '../components/ui/Switch';
import { Label } from '../components/ui/Label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { 
  Monitor, 
  Sun, 
  Moon, 
  Type, 
  Minimize2, 
  Contrast, 
  Accessibility, 
  Bell, 
  Shield, 
  User 
} from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import { useFontSize } from '../contexts/font-size-context';
import { useAccessibility } from '../contexts/accessibility-context';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, isLoading: themeLoading } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { settings: accessibilitySettings, updateSetting: updateAccessibilitySetting, isLoading: accessibilityLoading } = useAccessibility();

  const themeOptions = [
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow your system preference' },
    { value: 'light', label: 'Light', icon: Sun, description: 'Light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme' },
  ] as const;

  const fontSizeOptions = [
    { value: 'small', label: 'Small', description: 'Smaller text' },
    { value: 'medium', label: 'Medium', description: 'Default text size' },
    { value: 'large', label: 'Large', description: 'Larger text' },
    { value: 'extra-large', label: 'Extra Large', description: 'Much larger text' },
    { value: 'extra-extra-large', label: 'Extra Extra Large', description: 'Largest text size' },
  ] as const;

  const accessibilityOptions = [
    {
      key: 'reducedMotion' as const,
      label: 'Reduced motion',
      description: 'Limit animations and transitions.',
      icon: Minimize2,
    },
    {
      key: 'highContrast' as const,
      label: 'High contrast',
      description: 'Increase contrast for better visibility.',
      icon: Contrast,
    },
    {
      key: 'alwaysShowFocus' as const,
      label: 'Always show focus',
      description: 'Keep focus outlines visible on all elements.',
      icon: Accessibility,
    },
  ];

  const ComingSoonCard: React.FC<{ icon: React.ComponentType<any>; label: string }> = ({ icon: Icon, label }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg opacity-50 cursor-not-allowed">
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming soon</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="settings-page container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings.
        </p>
      </div>

      <TooltipProvider>
        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance & Accessibility</TabsTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="privacy" disabled>Privacy</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="account" disabled>Account</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="appearance" className="space-y-8">
            {/* Theme Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose light, dark, or follow your system preference.
                </p>
              </div>
              
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as typeof theme)}
                disabled={themeLoading}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {themeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center gap-2 cursor-pointer font-normal"
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Text Size Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Text Size
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adjust text size for readability. Works with browser zoom.
                </p>
              </div>
              
              <RadioGroup
                value={fontSize}
                onValueChange={(value) => setFontSize(value as typeof fontSize)}
                className="grid grid-cols-2 sm:grid-cols-5 gap-4"
              >
                {fontSizeOptions.map((option) => {
                  const sizeClass = option.value === 'small' ? 'text-xs' :
                                  option.value === 'medium' ? 'text-sm' :
                                  option.value === 'large' ? 'text-base' :
                                  option.value === 'extra-large' ? 'text-lg' :
                                  'text-xl'; // extra-extra-large
                  
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`font-${option.value}`} />
                      <Label 
                        htmlFor={`font-${option.value}`} 
                        className={`cursor-pointer font-normal ${sizeClass}`}
                        title={option.description}
                      >
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Accessibility Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure accessibility features to improve your experience.
                </p>
              </div>
              
              <div className="accessibility-options space-y-6">
                {accessibilityOptions.map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <option.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium">{option.label}</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={accessibilitySettings[option.key]}
                      onCheckedChange={(checked) => 
                        updateAccessibilitySetting(option.key, checked)
                      }
                      disabled={accessibilityLoading}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <ComingSoonCard icon={Bell} label="Notifications" />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <ComingSoonCard icon={Shield} label="Privacy" />
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <ComingSoonCard icon={User} label="Account" />
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </div>
  );
};