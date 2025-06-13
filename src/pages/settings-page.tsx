import React from 'react';
import { PageLayout } from '../components/page-layout';
import { LeftNav } from '../components/navigation/left/left-nav';
import { TopNav } from '../components/navigation/top/top-nav';

export const SettingsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="flex h-full">
        <LeftNav />
        <div className="flex-1 flex flex-col">
          <TopNav />
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
              
              {/* Profile Settings */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-500">Update your name, email, and profile picture</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Password & Security</h3>
                        <p className="text-sm text-gray-500">Change your password and security settings</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Configure your email notification preferences</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">In-App Notifications</h3>
                        <p className="text-sm text-gray-500">Manage your in-app notification settings</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Settings */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Workspace Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Team Management</h3>
                        <p className="text-sm text-gray-500">Manage team members and roles</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Manage
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Workspace Preferences</h3>
                        <p className="text-sm text-gray-500">Customize workspace settings and defaults</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Settings */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Calendar Integration</h3>
                        <p className="text-sm text-gray-500">Connect your calendar for task scheduling</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Connect
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">API Access</h3>
                        <p className="text-sm text-gray-500">Manage API keys and access tokens</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing & Subscription */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Current Plan</h3>
                        <p className="text-sm text-gray-500">View and manage your subscription</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Manage
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Billing History</h3>
                        <p className="text-sm text-gray-500">View your billing history and invoices</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Data Export</h3>
                        <p className="text-sm text-gray-500">Export your data and settings</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        Export
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Account Deletion</h3>
                        <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
