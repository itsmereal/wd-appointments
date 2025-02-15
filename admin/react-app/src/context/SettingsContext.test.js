import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings, SettingsSection } from './SettingsContext';
import settingsService from '../services/settings';
import { mockApiResponse, mockApiError } from '../test/test-utils';

// Mock the settings service
jest.mock('../services/settings');

describe('SettingsContext', () => {
  const mockSettings = {
    general: {
      businessName: 'Test Business',
      timezone: 'UTC',
    },
    email: {
      fromName: 'Test',
      fromEmail: 'test@example.com',
    },
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock successful settings load by default
    settingsService.getSettings.mockResolvedValue(mockSettings);
  });

  describe('useSettings hook', () => {
    it('provides initial settings state', async () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      // Initial state should match default settings
      expect(result.current.settings).toBeDefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('loads settings on mount', async () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Should start loading
      expect(result.current.loading).toBe(true);

      // Wait for settings to load
      await waitForNextUpdate();

      // Should have loaded settings
      expect(result.current.loading).toBe(false);
      expect(result.current.settings).toEqual(mockSettings);
      expect(settingsService.getSettings).toHaveBeenCalledTimes(1);
    });

    it('handles loading errors', async () => {
      const error = new Error('Failed to load settings');
      settingsService.getSettings.mockRejectedValue(error);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(error.message);
    });

    it('updates settings successfully', async () => {
      const newSettings = {
        businessName: 'Updated Business',
      };

      settingsService.updateSettings.mockResolvedValue({
        ...mockSettings,
        general: {
          ...mockSettings.general,
          ...newSettings,
        },
      });

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      // Update settings
      await act(async () => {
        await result.current.updateSettings(SettingsSection.GENERAL, newSettings);
      });

      expect(result.current.settings.general.businessName).toBe('Updated Business');
      expect(settingsService.updateSettings).toHaveBeenCalledTimes(1);
    });

    it('handles update errors', async () => {
      const error = new Error('Failed to update settings');
      settingsService.updateSettings.mockRejectedValue(error);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      // Attempt to update settings
      await act(async () => {
        await result.current.updateSettings(SettingsSection.GENERAL, {
          businessName: 'Updated Business',
        });
      });

      expect(result.current.error).toBe(error.message);
    });

    it('resets settings to defaults', async () => {
      settingsService.resetSettings.mockResolvedValue({});

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      // Reset settings
      await act(async () => {
        await result.current.resetSettings();
      });

      expect(settingsService.resetSettings).toHaveBeenCalledTimes(1);
      expect(result.current.settings).toEqual(expect.any(Object));
    });

    it('imports settings successfully', async () => {
      const importedSettings = {
        general: {
          businessName: 'Imported Business',
        },
      };

      settingsService.importSettings.mockResolvedValue(importedSettings);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      // Import settings
      await act(async () => {
        await result.current.importSettings(importedSettings);
      });

      expect(settingsService.importSettings).toHaveBeenCalledWith(importedSettings);
      expect(result.current.settings).toEqual(importedSettings);
    });

    it('exports settings successfully', async () => {
      settingsService.exportSettings.mockResolvedValue(mockSettings);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      // Export settings
      let exportedSettings;
      await act(async () => {
        exportedSettings = await result.current.exportSettings();
      });

      expect(settingsService.exportSettings).toHaveBeenCalled();
      expect(exportedSettings).toEqual(mockSettings);
    });

    it('gets settings for specific section', async () => {
      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      // Wait for initial settings load
      await waitForNextUpdate();

      const generalSettings = result.current.getSettings(SettingsSection.GENERAL);
      expect(generalSettings).toEqual(mockSettings.general);
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      const networkError = new Error('Network error');
      settingsService.getSettings.mockRejectedValue(networkError);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      await waitForNextUpdate();

      expect(result.current.error).toBe(networkError.message);
    });

    it('handles API errors', async () => {
      const apiError = new Error('API error');
      apiError.response = { status: 400, data: { message: 'Invalid request' } };
      settingsService.getSettings.mockRejectedValue(apiError);

      const wrapper = ({ children }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result, waitForNextUpdate } = renderHook(() => useSettings(), {
        wrapper,
      });

      await waitForNextUpdate();

      expect(result.current.error).toBe(apiError.message);
    });
  });
});
