import React, { useState, useEffect } from 'react';
import GeneralSettings from '../components/settings/GeneralSettings';
import EmailSettings from '../components/settings/EmailSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import CalendarIntegration from '../components/settings/CalendarIntegration';
import LicenseSettings from '../components/settings/LicenseSettings';
import AdvancedSettings from '../components/settings/AdvancedSettings';
import SystemInfo from '../components/settings/SystemInfo';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { Button } from '../components/ui/button';

// Default settings structure
const defaultSettings = {
  general: {},
  email: {},
  appearance: {},
  calendar: {},
  license: {},
  advanced: {},
};

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      className="wda-py-3"
    >
      {value === index && (
        <div className="wda-bg-white wda-shadow wda-rounded-lg wda-p-6">
          {children}
        </div>
      )}
    </div>
  );
}

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { showNotification } = useApp();
  const {
    settings = defaultSettings,
    updateSettings,
    loading: saving,
  } = useSettings();

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  const handleSettingsUpdate = async (section, newSettings) => {
    try {
      await updateSettings(section, newSettings);
    } catch (error) {
      showNotification('error', 'Failed to update settings');
    }
  };

  const handleSaveSettings = async () => {
    try {
      // The settings are saved automatically when updated
      showNotification('success', 'Settings saved successfully');
    } catch (error) {
      showNotification('error', 'Failed to save settings');
    }
  };

  const tabs = [
    {
      name: 'General',
      component: (
        <GeneralSettings
          settings={settings?.general || {}}
          onUpdate={(s) => handleSettingsUpdate('general', s)}
        />
      ),
    },
    {
      name: 'Email',
      component: (
        <EmailSettings
          settings={settings?.email || {}}
          onUpdate={(s) => handleSettingsUpdate('email', s)}
        />
      ),
    },
    {
      name: 'Appearance',
      component: (
        <AppearanceSettings
          settings={settings?.appearance || {}}
          onUpdate={(s) => handleSettingsUpdate('appearance', s)}
        />
      ),
    },
    {
      name: 'Calendar',
      component: (
        <CalendarIntegration
          settings={settings?.calendar || {}}
          onUpdate={(s) => handleSettingsUpdate('calendar', s)}
        />
      ),
    },
    {
      name: 'License',
      component: (
        <LicenseSettings
          settings={settings?.license || {}}
          onUpdate={(s) => handleSettingsUpdate('license', s)}
        />
      ),
    },
    {
      name: 'Advanced',
      component: (
        <AdvancedSettings
          settings={settings?.advanced || {}}
          onUpdate={(s) => handleSettingsUpdate('advanced', s)}
        />
      ),
    },
    { name: 'System Info', component: <SystemInfo /> },
  ];

  // Show loading state while settings are being fetched
  if (!settings) {
    return (
      <div className="wda-flex wda-justify-center wda-items-center wda-min-h-screen">
        <div className="wda-animate-spin wda-h-8 wda-w-8 wda-border-4 wda-border-primary-500 wda-border-t-transparent wda-rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="wda-w-full wda-relative">
      {/* Header */}
      <div className="wda-flex wda-justify-between wda-items-center wda-mb-6">
        <h1 className="wda-text-2xl wda-font-bold wda-text-gray-900">
          Settings
        </h1>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="wda-gap-2"
        >
          {saving ? (
            <>
              <div className="wda-animate-spin wda-h-4 wda-w-4 wda-border-2 wda-border-white wda-border-t-transparent wda-rounded-full" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="wda-bg-white wda-rounded-lg wda-shadow-sm wda-mb-6">
        <div className="wda-border-b wda-border-gray-200">
          <div className="wda-flex wda-space-x-4 wda-overflow-x-auto wda-p-4">
            {tabs.map((tab, index) => (
              <Button
                key={index}
                onClick={() => handleTabChange(index)}
                variant={activeTab === index ? 'default' : 'ghost'}
                className={
                  activeTab === index ? '' : 'wda-text-muted-foreground'
                }
                role="tab"
                aria-selected={activeTab === index}
                aria-controls={`settings-tabpanel-${index}`}
                id={`settings-tab-${index}`}
              >
                {tab.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="wda-relative wda-pb-20">
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}

        {/* Sticky Save Settings Bar */}
        <div className="wda-sticky wda-bottom-0 wda-left-0 wda-right-0 wda-bg-white wda-border-t wda-border-gray-200 wda-p-4 wda-shadow-lg wda-z-10">
          <div className="wda-max-w-7xl wda-mx-auto wda-flex wda-justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              size="lg"
              className="wda-gap-2"
            >
              {saving ? (
                <>
                  <div className="wda-animate-spin wda-h-4 wda-w-4 wda-border-2 wda-border-white wda-border-t-transparent wda-rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
