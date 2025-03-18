import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Key, AlertTriangle, Check, Save, Trash2 } from 'lucide-react';
import { hasApiKey, saveApiKey, clearApiKey } from '@/lib/llmService';

const SettingsPage: React.FC = () => {
  console.log('SettingsPage component rendered');
  
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Load API key status on mount
  useEffect(() => {
    console.log('SettingsPage useEffect running');
    setHasKey(hasApiKey());
  }, []);
  
  // Handle saving API key
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(apiKey.trim());
      setHasKey(true);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };
  
  // Handle clearing API key
  const handleClearApiKey = () => {
    clearApiKey();
    setApiKey('');
    setHasKey(false);
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Settings</h1>
      
      {/* Settings content */}
      <div className="space-y-8">
        {/* API Key section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-medium">OpenAI API Key</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add your OpenAI API key to enable custom app generation. Your key is stored locally in your browser and never sent to our servers.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="api-key" className="text-sm font-medium">
                  {hasKey ? 'API Key is set' : 'Enter your OpenAI API Key'}
                </Label>
                
                {hasKey && (
                  <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check size={12} />
                    <span>Active</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-24"
                  />
                  
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="flex items-center gap-1"
                >
                  <Save size={16} />
                  <span>Save</span>
                </Button>
                
                {hasKey && (
                  <Button
                    variant="destructive"
                    onClick={handleClearApiKey}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
              
              {saveSuccess && (
                <div className="bg-green-100 text-green-700 text-sm p-2 rounded-md flex items-center gap-2">
                  <Check size={16} />
                  <span>API key saved successfully!</span>
                </div>
              )}
              
              {!hasKey && (
                <div className="bg-amber-100 text-amber-700 text-sm p-3 rounded-md flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <div>
                    <p className="font-medium">No API key set</p>
                    <p className="text-xs mt-1">Without an API key, you'll only have access to demo apps.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Appearance section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-medium">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">
                  Dark Mode
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch id="dark-mode" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="animations" className="text-sm font-medium">
                  Animations
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable or disable UI animations
                </p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>
          </div>
        </div>
        
        {/* About section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-medium">About</h2>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              AppGenius v1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              Create custom micro-apps for your dashboard using AI.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2023 AppGenius Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 