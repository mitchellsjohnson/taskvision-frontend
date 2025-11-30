import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
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
  Accessibility
} from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import { useFontSize } from '../contexts/font-size-context';
import { useAccessibility } from '../contexts/accessibility-context';
import { SmsSettingsPage } from './settings/sms-settings-page';
import { SmsDebugPage } from './ecosystem-admin/sms-debug-page';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, isLoading: themeLoading } = useTheme();
  const { fontSize, setFontSize } = useFontSize();
  const { settings: accessibilitySettings, updateSetting: updateAccessibilitySetting, isLoading: accessibilityLoading } = useAccessibility();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!isAuthenticated) return;

      try {
        const accessToken = await getAccessTokenSilently();
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const roles = payload['https://taskvision.app/roles'] || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        // In local dev with auth disabled, grant ecosystem-admin role
        setUserRoles(['ecosystem-admin']);
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, getAccessTokenSilently]);

  // In local dev (localhost), always show ecosystem admin features
  const isLocalDev = window.location.hostname === 'localhost';
  const hasEcosystemAdminRole = isLocalDev || userRoles.includes('ecosystem-admin');

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

  const [activeTab, setActiveTab] = useState('appearance');
  const [isFixing, setIsFixing] = useState(false);

  const handleFixPriorities = async () => {
    const toastId = toast.loading('🔧 Fixing task priorities...');
    setIsFixing(true);

    try {
      const accessToken = await getAccessTokenSilently();
      const API_SERVER_URL = process.env.REACT_APP_API_SERVER_URL;

      const response = await fetch(`${API_SERVER_URL}/api/tasks/fix-priorities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fix priorities');
      }

      const result = await response.json();
      toast.success('✓ Task priorities fixed successfully!', { id: toastId });
      console.log('Fix priorities result:', result);
    } catch (error) {
      console.error('Error fixing priorities:', error);
      toast.error('Failed to fix priorities. Please try again.', { id: toastId });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="settings-page container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'appearance'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'sms'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
              }`}
          >
            SMS
          </button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  Notifications
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  Privacy
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all text-muted-foreground opacity-50 cursor-not-allowed"
                >
                  Account
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {hasEcosystemAdminRole && (
            <button
              onClick={() => setActiveTab('ecosystem-admin')}
              className={`flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'ecosystem-admin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                }`}
            >
              Ecosystem Admin
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'appearance' && (
            <div className="space-y-8">
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

              {/* Maintenance Section */}
              <div className="space-y-4 border-t pt-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Maintenance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    System maintenance and data cleanup utilities.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Fix Task Priorities</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recalculate and fix duplicate priority numbers for all tasks.
                      This will ensure MIT tasks are numbered 1-3 and LIT tasks are numbered sequentially.
                    </p>
                    <button
                      onClick={handleFixPriorities}
                      disabled={isFixing}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      {isFixing ? '🔧 Fixing...' : '🔧 Fix Priorities Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4">
              <SmsSettingsPage />
            </div>
          )}

          {activeTab === 'ecosystem-admin' && hasEcosystemAdminRole && (
            <div className="space-y-4">
              <SmsDebugPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};