import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/layouts/PageWrapper/PageLayout';
import { Button } from '@/components/forms/Button';
import { TextInput } from '@/components/forms/TextInput';
import { DropdownSelect } from '@/components/forms/DropdownSelect';
import { TextAreaInput } from '@/components/forms/TextAreaInput';
import { CheckboxInput } from '@/components/forms/CheckboxInput';
import { useToast } from '@/providers/ToastContext';
import { useAuth } from '@/auth/AuthProvider';
import { usersService } from '@/features/users/api/users.api';
import { settingsTabs } from '@/utils/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Zap, Globe, Building, Bell, Search, Save,
  CheckCircle2, AlertCircle, Key, Laptop, Smartphone, Monitor,
  LogOut, Plus, Trash2, Copy, Check, Eye, EyeOff, RefreshCw,
  Sparkles, Calendar, Clock, DollarSign, Lock, ShieldCheck,
  CheckSquare, ArrowRight, X, ExternalLink
} from 'lucide-react';

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  icon: any;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  runs: number;
  active: boolean;
}

import { ComingSoonPlaceholder } from '@/components/ui/ComingSoonPlaceholder';

export function Settings() {
  return (
    <PageLayout title="Settings" showBackButton={false}>
      <ComingSoonPlaceholder moduleName="Settings" />
    </PageLayout>
  );
}

export function SettingsOld() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const userRole = user?.role?.name;

  const [activeTab, setActiveTab] = useState('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '+91 98765 43210',
    job_title: (user as any)?.job_title || 'Senior Product Architect',
    bio: 'Passionate about building high-performance, enterprise-grade cloud software and streamlining cross-functional engineering workflows.',
    timezone: (user as any)?.timezone || 'IST',
  });

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
        email: user.email || '',
        phone: (user as any)?.phone || prev.phone,
        job_title: (user as any)?.job_title || prev.job_title,
      }));
    }
  }, [user]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    projectMentions: true,
    taskAssignments: true,
    statusUpdates: true,
    dueDateReminders: true,
    weeklyDigest: true,
    securityAlerts: true,
    marketingUpdates: false,
    frequency: 'instant',
  });

  // Localization State
  const [localization, setLocalization] = useState({
    language: 'en-US',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 'Monday',
    numberFormat: 'standard',
  });

  // Organization State
  const [organization, setOrganization] = useState({
    companyName: 'TechnoRUCS Professional Services',
    supportEmail: 'enterprise@technorucs.zoho.rep',
    domain: 'technorucs.zoho.rep',
    globalTimezone: 'IST',
    fiscalYearStart: 'apr',
    baseCurrency: 'INR',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 'sess-1',
      device: 'Windows 11 Workstation',
      browser: 'Chrome 126.0 (64-bit)',
      location: 'Kolkata, India (IP: 103.220.x.x)',
      lastActive: 'Active now (This device)',
      isCurrent: true,
      icon: Monitor,
    },
    {
      id: 'sess-2',
      device: 'MacBook Pro M3 Max',
      browser: 'Safari 17.5',
      location: 'Kolkata, India',
      lastActive: '3 hours ago',
      isCurrent: false,
      icon: Laptop,
    },
    {
      id: 'sess-3',
      device: 'Apple iPhone 15 Pro',
      browser: 'Zoho Mobile App v4.2',
      location: 'New Delhi, India',
      lastActive: 'Yesterday at 18:42',
      isCurrent: false,
      icon: Smartphone,
    },
  ]);

  const [apiTokens, setApiTokens] = useState([
    { id: 'token-1', name: 'CLI Deployment Sync', prefix: 'zoho_live_8f9a...4c1b', created: '2026-06-12', expires: 'Never' },
    { id: 'token-2', name: 'GitHub Actions CI/CD', prefix: 'zoho_auto_22d1...99e3', created: '2026-07-01', expires: '30 days' },
  ]);

  // Automations State
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: 'auto-1',
      name: 'Issue Completion Sync',
      trigger: 'When an issue moves to Done status',
      action: 'Automatically update connected milestone progress & notify watcher',
      runs: 1420,
      active: true,
    },
    {
      id: 'auto-2',
      name: 'High Priority Bug Escalation',
      trigger: 'When priority is marked as Urgent or P0',
      action: 'Assign to Engineering Lead & post alert in #critical-incidents Slack channel',
      runs: 84,
      active: true,
    },
    {
      id: 'auto-3',
      name: 'Stale Task Auto-Flagging',
      trigger: 'When task remains in Review > 7 calendar days',
      action: 'Add "needs-attention" tag and send summary email to Project Manager',
      runs: 312,
      active: false,
    },
  ]);

  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    trigger: 'When new task is created',
    action: 'Send notification to assigned team',
  });

  // Handle saving across tabs
  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'personal' && user?.id) {
        await usersService.updateUser(user.id, {
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          display_name: profileForm.display_name,
          phone: profileForm.phone,
          job_title: profileForm.job_title,
        });
        await refreshProfile();
      }
      
      // Simulate network save for all preferences
      await new Promise(resolve => setTimeout(resolve, 600));
      setHasUnsavedChanges(false);
      showToast('success', 'Preferences Saved', `${tabs.find(t => t.id === activeTab)?.label || 'Settings'} successfully updated and synced.`);
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('error', 'Update Failed', 'An error occurred while saving your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '',
        email: user.email || '',
        phone: (user as any)?.phone || '+91 98765 43210',
        job_title: (user as any)?.job_title || 'Senior Product Architect',
        bio: 'Passionate about building high-performance, enterprise-grade cloud software and streamlining cross-functional engineering workflows.',
        timezone: (user as any)?.timezone || 'IST',
      });
    }
    setHasUnsavedChanges(false);
    showToast('info', 'Changes Discarded', 'Reverted back to last saved preferences.');
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    showToast('success', 'Session Revoked', 'Device disconnected. The user will be prompted to re-authenticate.');
  };

  const handleCreateToken = () => {
    const randomHex = Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6);
    const newToken = {
      id: `token-${Date.now()}`,
      name: `API Token (${new Date().toLocaleDateString()})`,
      prefix: `zoho_live_${randomHex}`,
      created: new Date().toISOString().split('T')[0],
      expires: '90 days',
    };
    setApiTokens(prev => [newToken, ...prev]);
    showToast('success', 'API Token Generated', 'Token created successfully. Make sure to copy and store it securely.');
  };

  const handleAddAutomation = () => {
    if (!newWorkflow.name.trim()) {
      showToast('error', 'Validation Error', 'Please provide a name for the workflow rule.');
      return;
    }
    const rule: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: newWorkflow.name,
      trigger: newWorkflow.trigger,
      action: newWorkflow.action,
      runs: 0,
      active: true,
    };
    setAutomations(prev => [rule, ...prev]);
    setNewWorkflow({ name: '', trigger: 'When new task is created', action: 'Send notification to assigned team' });
    setShowNewWorkflowModal(false);
    showToast('success', 'Workflow Active', `Rule "${rule.name}" is now enabled.`);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Profile', icon: Users, desc: 'Public identity, bio & avatar', category: 'ACCOUNT PREFERENCES' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email digests & desktop alerts', category: 'ACCOUNT PREFERENCES' },
    { id: 'localization', label: 'Localization', icon: Globe, desc: 'Language, date & time formatting', category: 'ACCOUNT PREFERENCES' },
    ...(settingsTabs.organization(user?.role as any) ? [{ id: 'organization', label: 'Organization', icon: Building, desc: 'Company branding & global defaults', category: 'WORKSPACE & SECURITY' }] : []),
    { id: 'security', label: 'Security & Access', icon: Shield, desc: '2FA, active sessions & API tokens', category: 'WORKSPACE & SECURITY' },
    { id: 'automations', label: 'Smart Automations', icon: Zap, desc: 'Visual rules & workflow triggers', category: 'WORKSPACE & SECURITY' },
  ];

  const filteredTabs = tabs.filter(t => 
    t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(filteredTabs.map(t => t.category)));

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-slate-200 dark:bg-slate-700', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score === 2) return { label: 'Moderate', color: 'bg-amber-500', width: '50%' };
    if (score === 3) return { label: 'Strong', color: 'bg-brand-teal-500', width: '75%' };
    return { label: 'Unbreakable', color: 'bg-emerald-500', width: '100%' };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  return (
    <PageLayout 
      title="Workspace Settings" 
      subtitle="Configure your personal identity, notification channels, regional localization, and security preferences."
    >
      <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto w-full pb-20 pt-2">
        
        {/* Left Navigation Sidebar */}
        <div className="w-full lg:w-[310px] shrink-0 space-y-6 lg:sticky lg:top-24 self-start">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter settings..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl pl-10 pr-9 py-3 text-[13.5px] font-medium focus:ring-2 focus:ring-brand-teal-500/40 focus:border-brand-teal-500 outline-none transition-all placeholder-slate-400 text-slate-800 dark:text-slate-200 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Categories & Buttons */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 flex items-center justify-between">
                  <span>{category}</span>
                </div>

                <div className="space-y-1.5">
                  {filteredTabs
                    .filter(t => t.category === category)
                    .map((tab) => {
                      const isActive = activeTab === tab.id;
                      const Icon = tab.icon;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl transition-all text-left relative group select-none outline-none ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-none border border-slate-200/80 dark:border-slate-700 font-bold text-slate-900 dark:text-white'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40 border border-transparent text-slate-600 dark:text-slate-400 font-medium'
                          }`}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeSettingsIndicator" 
                              className="absolute left-0 top-3 bottom-3 w-1 bg-brand-teal-500 rounded-r-full shadow-sm shadow-brand-teal-500/50"
                            />
                          )}

                          <div className={`p-2.5 rounded-xl transition-all shrink-0 ${
                            isActive
                              ? 'bg-brand-teal-500/10 text-brand-teal-600 dark:bg-brand-teal-400/10 dark:text-brand-teal-400 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 group-hover:text-brand-teal-600 dark:group-hover:text-brand-teal-400 group-hover:bg-brand-teal-500/5'
                          }`}>
                            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                          </div>

                          <div className="flex-1 min-w-0 mt-0.5">
                            <div className="text-[13.5px] leading-snug font-bold truncate">
                              {tab.label}
                            </div>
                            <div className="text-[11.5px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {tab.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {filteredTabs.length === 0 && (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No settings found</p>
                <p className="text-[11px] text-slate-400 mt-1">Try searching for terms like "password", "language" or "alerts".</p>
              </div>
            )}
          </div>

          {/* Quick Help Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-teal-500/10 via-slate-50/80 to-brand-teal-500/5 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-800 border border-brand-teal-500/20 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-brand-teal-500 shrink-0" />
              <span>Enterprise Customization</span>
            </div>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
              Need custom permission tiers or webhook integrations? Organization managers can configure global rule matrices anytime.
            </p>
          </div>
        </div>

        {/* Right Content Area Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-200/80 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-none flex flex-col overflow-hidden relative">
          
          {/* Header Bar */}
          <div className="px-6 sm:px-8 lg:px-10 py-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h1>
                {hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-[13.5px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                {tabs.find(t => t.id === activeTab)?.desc}
              </p>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Live Workspace Sync</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* 1. PERSONAL PROFILE TAB */}
                {activeTab === 'personal' && (
                  <>
                    {/* Hero Profile Identity Card */}
                    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white dark:from-slate-800/90 dark:to-slate-900/90 p-6 sm:p-8 rounded-3xl border border-slate-700/60 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-teal-500/10 to-transparent pointer-events-none"></div>
                      
                      <div className="flex items-center gap-5 relative z-10 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl shadow-brand-teal-500/20 border-2 border-white/20">
                            {(profileForm.first_name?.[0] || 'A')}{(profileForm.last_name?.[0] || 'U')}
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" title="Online" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight truncate">
                              {profileForm.display_name || 'Anonymous User'}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-brand-teal-500/20 text-brand-teal-300 border border-brand-teal-400/30">
                              {userRole || 'Member'}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-300 font-medium mt-1 flex items-center gap-2 truncate">
                            <span>{profileForm.job_title || 'Product Team'}</span>
                            <span>•</span>
                            <span className="text-brand-teal-400 font-mono text-xs">{user?.public_id || 'ID: ZO-8492'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => showToast('info', 'Avatar Picker', 'Select a PNG or JPG file up to 5MB.')}
                          className="!bg-white/10 hover:!bg-white/20 !border-white/20 !text-white flex-1 sm:flex-initial"
                        >
                          Change Avatar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => showToast('info', 'Avatar Reset', 'Reverted to initials avatar.')}
                          className="!text-slate-400 hover:!text-white hover:!bg-white/10"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Profile Information Form */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Information</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Update your personal details and public display preferences.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">First Name</label>
                          <TextInput 
                            value={profileForm.first_name} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, first_name: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Name</label>
                          <TextInput 
                            value={profileForm.last_name} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, last_name: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Display Name</label>
                          <TextInput 
                            value={profileForm.display_name} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, display_name: e.target.value })); setHasUnsavedChanges(true); }}
                            placeholder="e.g. Alex M."
                            className="bg-white dark:bg-slate-800"
                          />
                          <p className="text-[11px] text-slate-400 font-medium">This name is displayed in task assignments, comments, and team chats.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Job Title</label>
                          <TextInput 
                            value={profileForm.job_title} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, job_title: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Email Address</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 lowercase font-bold">✓ Verified</span>
                          </label>
                          <TextInput 
                            value={profileForm.email} 
                            disabled
                            className="bg-slate-100 dark:bg-slate-800/40 opacity-70 cursor-not-allowed"
                          />
                          <p className="text-[11px] text-slate-400 font-medium">To change your primary email address, contact your workspace administrator.</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Phone Number</label>
                          <TextInput 
                            value={profileForm.phone} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, phone: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Professional Bio</label>
                          <TextAreaInput 
                            value={profileForm.bio} 
                            onChange={(e) => { setProfileForm(p => ({ ...p, bio: e.target.value })); setHasUnsavedChanges(true); }}
                            className="min-h-[100px] bg-white dark:bg-slate-800 text-[13.5px] leading-relaxed" 
                            placeholder="Write a brief introduction..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <>
                    {/* Master Switch Banner */}
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-teal-500/15 via-slate-50/80 to-brand-teal-500/5 dark:from-brand-teal-500/10 dark:via-slate-800/60 dark:to-slate-800 border border-brand-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-teal-500 text-white rounded-2xl shadow-lg shadow-brand-teal-500/20">
                          <Bell className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white">Delivery Frequency</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Control how quickly you receive notification batches.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto justify-center">
                        {[
                          { id: 'instant', label: 'Instant' },
                          { id: 'hourly', label: 'Hourly Digest' },
                          { id: 'daily', label: 'Daily Brief' },
                        ].map((freq) => (
                          <button
                            key={freq.id}
                            onClick={() => { setNotifications(n => ({ ...n, frequency: freq.id })); setHasUnsavedChanges(true); }}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              notifications.frequency === freq.id
                                ? 'bg-brand-teal-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notification Channels */}
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                        <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/80">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">In-App & Desktop Alerts</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { key: 'projectMentions', title: 'Direct Mentions & Tags', desc: 'When you are @mentioned in tasks, comments, or documentation notes.' },
                            { key: 'taskAssignments', title: 'Task & Issue Assignments', desc: 'When an item is directly assigned or re-assigned to your queue.' },
                            { key: 'statusUpdates', title: 'Milestone & Project Transitions', desc: 'When projects you follow transition across critical workflow stages.' },
                            { key: 'dueDateReminders', title: 'Due Date Approaching Warnings', desc: 'Automated alerts 24 hours prior to scheduled task deadlines.' },
                          ].map((item) => (
                            <div key={item.key} className="p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <div className="pr-6 min-w-0">
                                <p className="text-[14.5px] font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.desc}</p>
                              </div>
                              <CheckboxInput 
                                checked={(notifications as any)[item.key]} 
                                onChange={(e: any) => { const checked = typeof e === 'boolean' ? e : e?.checked ?? false; setNotifications(prev => ({ ...prev, [item.key]: checked })); setHasUnsavedChanges(true); }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                        <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/80">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Email Digests & Reports</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {[
                            { key: 'weeklyDigest', title: 'Weekly Productivity Summary', desc: 'A curated digest of your completed tasks, logged hours, and team velocity sent every Monday.' },
                            { key: 'securityAlerts', title: 'Security & New Device Logins', desc: 'Critical alerts whenever a new browser or IP address signs into your account.' },
                            { key: 'marketingUpdates', title: 'Product Updates & Best Practices', desc: 'Occasional news on new Zoho features, webinars, and release notes.' },
                          ].map((item) => (
                            <div key={item.key} className="p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <div className="pr-6 min-w-0">
                                <p className="text-[14.5px] font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.desc}</p>
                              </div>
                              <CheckboxInput 
                                checked={(notifications as any)[item.key]} 
                                onChange={(e: any) => { const checked = typeof e === 'boolean' ? e : e?.checked ?? false; setNotifications(prev => ({ ...prev, [item.key]: checked })); setHasUnsavedChanges(true); }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. LOCALIZATION TAB */}
                {activeTab === 'localization' && (
                  <>
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
                      <div className="pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Regional Preferences</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Customize how dates, times, and numbers are rendered across your workspace.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Interface Language</label>
                          <DropdownSelect 
                            value={localization.language}
                            onChange={(e) => { setLocalization(l => ({ ...l, language: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: 'English (United States) - EN-US', value: 'en-US' },
                              { label: 'English (United Kingdom) - EN-GB', value: 'en-GB' },
                              { label: 'Español (Spanish) - ES', value: 'es' },
                              { label: 'Français (French) - FR', value: 'fr' },
                              { label: 'Deutsch (German) - DE', value: 'de' },
                              { label: 'Hindi (भारत) - HI', value: 'hi' },
                              { label: '日本語 (Japanese) - JA', value: 'ja' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date Format</label>
                          <DropdownSelect 
                            value={localization.dateFormat}
                            onChange={(e) => { setLocalization(l => ({ ...l, dateFormat: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: 'DD-MM-YYYY (e.g. 16-07-2026)', value: 'DD-MM-YYYY' },
                              { label: 'MM/DD/YYYY (e.g. 07/16/2026)', value: 'MM/DD/YYYY' },
                              { label: 'YYYY-MM-DD (e.g. 2026-07-16)', value: 'YYYY-MM-DD' },
                              { label: 'DD MMM YYYY (e.g. 16 Jul 2026)', value: 'DD MMM YYYY' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Time Format</label>
                          <DropdownSelect 
                            value={localization.timeFormat}
                            onChange={(e) => { setLocalization(l => ({ ...l, timeFormat: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: '12-hour AM/PM (03:59 PM)', value: '12h' },
                              { label: '24-hour Military (15:59)', value: '24h' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">First Day of Week</label>
                          <DropdownSelect 
                            value={localization.firstDayOfWeek}
                            onChange={(e) => { setLocalization(l => ({ ...l, firstDayOfWeek: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: 'Monday (Standard Business)', value: 'Monday' },
                              { label: 'Sunday (US & Canada)', value: 'Sunday' },
                              { label: 'Saturday (Middle East)', value: 'Saturday' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Number & Currency Notation</label>
                          <DropdownSelect 
                            value={localization.numberFormat}
                            onChange={(e) => { setLocalization(l => ({ ...l, numberFormat: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: '1,234,567.89 USD (Standard US/UK dot decimal)', value: 'standard' },
                              { label: '1.234.567,89 EUR (European comma decimal)', value: 'european' },
                              { label: '12,34,567.89 INR (Indian Lakh/Crore grouping)', value: 'indian' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-5 h-5 text-brand-teal-400" />
                          <h3 className="text-sm font-bold tracking-wide uppercase text-slate-200">Live Rendering Preview</h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">Sample Task #ZO-4021</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Due Date</p>
                          <p className="font-mono text-base font-bold text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-brand-teal-400" />
                            {localization.dateFormat === 'DD-MM-YYYY' && '16-07-2026'}
                            {localization.dateFormat === 'MM/DD/YYYY' && '07/16/2026'}
                            {localization.dateFormat === 'YYYY-MM-DD' && '2026-07-16'}
                            {localization.dateFormat === 'DD MMM YYYY' && '16 Jul 2026'}
                          </p>
                        </div>

                        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Timestamp</p>
                          <p className="font-mono text-base font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-brand-teal-400" />
                            {localization.timeFormat === '12h' ? '03:59:54 PM' : '15:59:54'}
                          </p>
                        </div>

                        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Budget Allocation</p>
                          <p className="font-mono text-base font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            {localization.numberFormat === 'standard' && '$1,250,400.00'}
                            {localization.numberFormat === 'european' && '1.250.400,00 €'}
                            {localization.numberFormat === 'indian' && '₹12,50,400.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 4. ORGANIZATION TAB */}
                {activeTab === 'organization' && settingsTabs.organization(user?.role as any) && (
                  <>
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Organization Identity</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Company profile and global defaults applied across all workspace projects.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
                          TR
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-slate-900 dark:text-white truncate">{organization.companyName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-2 truncate">
                            <span>{organization.domain}</span>
                            <span>•</span>
                            <span>Enterprise Tier</span>
                          </p>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => showToast('info', 'Brand Settings', 'Logo update option requires organization owner verification.')}
                        >
                          Upload Logo
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Company Legal Name</label>
                          <TextInput 
                            value={organization.companyName}
                            onChange={(e) => { setOrganization(o => ({ ...o, companyName: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Support Email Address</label>
                          <TextInput 
                            value={organization.supportEmail}
                            onChange={(e) => { setOrganization(o => ({ ...o, supportEmail: e.target.value })); setHasUnsavedChanges(true); }}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Global Default Timezone</label>
                          <DropdownSelect 
                            value={organization.globalTimezone}
                            onChange={(e) => { setOrganization(o => ({ ...o, globalTimezone: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: 'IST - India Standard Time (UTC+05:30)', value: 'IST' },
                              { label: 'UTC - Coordinated Universal Time', value: 'UTC' },
                              { label: 'EST - Eastern Standard Time (UTC-05:00)', value: 'EST' },
                              { label: 'PST - Pacific Standard Time (UTC-08:00)', value: 'PST' },
                              { label: 'CET - Central European Time (UTC+01:00)', value: 'CET' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fiscal Year Start Month</label>
                          <DropdownSelect 
                            value={organization.fiscalYearStart}
                            onChange={(e) => { setOrganization(o => ({ ...o, fiscalYearStart: e.value })); setHasUnsavedChanges(true); }}
                            options={[
                              { label: 'April 1st (Indian / UK Standard)', value: 'apr' },
                              { label: 'January 1st (Calendar Year)', value: 'jan' },
                              { label: 'July 1st (Australian Standard)', value: 'jul' },
                              { label: 'October 1st (US Federal Standard)', value: 'oct' },
                            ]}
                            className="bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="col-span-1 sm:col-span-2 space-y-2">
                          <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">Default Working Days</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                              const isSelected = organization.workingDays.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => {
                                    const next = isSelected 
                                      ? organization.workingDays.filter(d => d !== day)
                                      : [...organization.workingDays, day];
                                    setOrganization(o => ({ ...o, workingDays: next }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                    isSelected
                                      ? 'bg-brand-teal-500 text-white border-brand-teal-500 shadow-sm'
                                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 5. SECURITY & ACCESS TAB */}
                {activeTab === 'security' && (
                  <>
                    {/* SSO & Two-Factor Authentication Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Two-Factor Authentication</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Add an extra layer of security requiring a one-time verification code from an authenticator app when signing in.
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <span className={`text-xs font-bold ${twoFactorEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {twoFactorEnabled ? 'Enabled & Active' : 'Currently Disabled'}
                          </span>
                          <Button 
                            variant={twoFactorEnabled ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => {
                              setTwoFactorEnabled(!twoFactorEnabled);
                              showToast('success', 'Security Updated', `Two-Factor Authentication is now ${!twoFactorEnabled ? 'enabled' : 'disabled'}.`);
                            }}
                          >
                            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                            <Lock className="w-6 h-6" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Password Management</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Regularly updating your password prevents unauthorized access and protects sensitive workspace data.
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-mono">Last changed: 42 days ago</span>
                          <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowPasswordModal(true)}
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Active Sessions Table */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                      <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Active Devices & Sessions</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Devices currently logged into your Zoho workspace account.</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSessions(prev => prev.filter(s => s.isCurrent));
                            showToast('success', 'Sessions Terminated', 'All other active sessions have been signed out.');
                          }}
                          className="!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-500/10 text-xs"
                        >
                          Sign Out All Other Devices
                        </Button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {sessions.map((sess) => {
                          const Icon = sess.icon;
                          return (
                            <div key={sess.id} className="p-5 sm:p-6 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl shrink-0">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sess.device}</span>
                                    <span className="text-xs text-slate-400 font-mono">• {sess.browser}</span>
                                    {sess.isCurrent && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        Current Session
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {sess.location} • <span className="font-medium text-slate-600 dark:text-slate-300">{sess.lastActive}</span>
                                  </p>
                                </div>
                              </div>

                              {!sess.isCurrent && (
                                <button
                                  onClick={() => handleRevokeSession(sess.id)}
                                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                                  title="Revoke session"
                                >
                                  <LogOut className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* API Tokens Card */}
                    <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                      <div className="px-6 py-4 bg-slate-50/60 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Personal Access Tokens</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Authenticate API requests, scripts, and third-party CI/CD integrations.</p>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={handleCreateToken}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Generate New Token
                        </Button>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {apiTokens.map((token) => (
                          <div key={token.id} className="p-5 sm:p-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="p-3 bg-brand-teal-500/10 text-brand-teal-600 rounded-2xl shrink-0">
                                <Key className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{token.name}</p>
                                <div className="flex items-center gap-3 mt-1 font-mono text-xs text-slate-500">
                                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{token.prefix}</span>
                                  <span>Created: {token.created}</span>
                                  <span>•</span>
                                  <span>Expires: {token.expires}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => showToast('success', 'Copied to Clipboard', 'Token identifier copied.')}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Copy prefix"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setApiTokens(prev => prev.filter(t => t.id !== token.id));
                                  showToast('info', 'Token Deleted', `Token "${token.name}" has been revoked.`);
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title="Revoke token"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 6. AUTOMATIONS TAB */}
                {activeTab === 'automations' && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-brand-teal-500/15 via-slate-50/80 to-transparent dark:from-brand-teal-500/10 dark:via-slate-800/60 dark:to-transparent rounded-3xl border border-brand-teal-500/30">
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-brand-teal-500" />
                          <span>Smart Workflow Triggers</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg font-medium leading-relaxed">
                          Automate repetitive tasks across issues, milestones, and notification queues with no-code visual trigger actions.
                        </p>
                      </div>

                      <Button 
                        onClick={() => setShowNewWorkflowModal(true)}
                        className="bg-brand-teal-600 hover:bg-brand-teal-700 text-white font-bold shrink-0 shadow-lg shadow-brand-teal-500/20"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Create Workflow Rule
                      </Button>
                    </div>

                    {/* Automations List */}
                    <div className="space-y-4">
                      {automations.map((rule) => (
                        <div 
                          key={rule.id}
                          className={`p-6 rounded-3xl border transition-all ${
                            rule.active
                              ? 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 shadow-2xs'
                              : 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0">
                              <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                                rule.active ? 'bg-brand-teal-500/15 text-brand-teal-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                              }`}>
                                <Zap className="w-5 h-5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h4 className="text-base font-black text-slate-900 dark:text-white">{rule.name}</h4>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    rule.active 
                                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                  }`}>
                                    {rule.active ? 'Active' : 'Paused'}
                                  </span>
                                  <span className="text-xs font-mono text-slate-400">Runs: {rule.runs.toLocaleString()}</span>
                                </div>

                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">Trigger Condition</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{rule.trigger}</span>
                                  </div>

                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                    <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">Automated Action</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{rule.action}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setAutomations(prev => prev.map(a => a.id === rule.id ? { ...a, active: !a.active } : a));
                                  showToast('info', 'Workflow Status', `Rule "${rule.name}" has been ${!rule.active ? 'activated' : 'paused'}.`);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                  rule.active
                                    ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
                                    : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                                }`}
                              >
                                {rule.active ? 'Pause' : 'Activate'}
                              </button>
                              <button
                                onClick={() => {
                                  setAutomations(prev => prev.filter(a => a.id !== rule.id));
                                  showToast('info', 'Rule Deleted', `Workflow "${rule.name}" removed.`);
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="px-6 sm:px-8 lg:px-10 py-5 bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-4 h-4 text-brand-teal-500 animate-pulse" />
              <span>Workspace preferences are securely encrypted and cached across all active tabs.</span>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDiscardChanges}
                disabled={!hasUnsavedChanges && !isSaving}
                className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Discard Changes
              </Button>
              <Button 
                variant="primary" 
                size="md"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="shadow-lg shadow-brand-teal-500/25 px-7 !rounded-xl transition-transform active:scale-95"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving Preferences...' : 'Save Preferences'}
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Unsaved Changes Pill */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-6"
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-sm font-bold text-white">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDiscardChanges}
                className="!text-slate-300 hover:!text-white hover:!bg-white/10 text-xs font-bold"
              >
                Reset
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleSavePreferences}
                disabled={isSaving}
                className="!bg-brand-teal-500 hover:!bg-brand-teal-400 text-white shadow-md shadow-brand-teal-500/30 text-xs font-bold px-4"
              >
                Save Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: Change Password */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-teal-500/10 text-brand-teal-600 rounded-xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Change Password</h3>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Current Password</label>
                  <TextInput 
                    type={showPassword ? "text" : "password"} 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">New Password</label>
                  <TextInput 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Min 8 chars, mix of symbols & letters"
                  />
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${pwdStrength.color}`} style={{ width: pwdStrength.width }}></div>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Strength:</span>
                        <span className={pwdStrength.color.replace('bg-', 'text-')}>{pwdStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                  <TextInput 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <CheckboxInput checked={showPassword} onChange={(e: any) => setShowPassword(typeof e === 'boolean' ? e : e?.checked ?? false)} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>Show password characters</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    if (!currentPassword || !newPassword) {
                      showToast('error', 'Validation Error', 'Please fill in all required password fields.');
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      showToast('error', 'Mismatch', 'New password and confirmation do not match.');
                      return;
                    }
                    setShowPasswordModal(false);
                    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                    showToast('success', 'Password Updated', 'Your account credentials have been changed successfully.');
                  }}
                >
                  Update Credential
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Create Smart Workflow */}
      <AnimatePresence>
        {showNewWorkflowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-teal-500/10 text-brand-teal-600 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Create Smart Workflow Rule</h3>
                </div>
                <button onClick={() => setShowNewWorkflowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Rule Name</label>
                  <TextInput 
                    value={newWorkflow.name} 
                    onChange={(e) => setNewWorkflow(w => ({ ...w, name: e.target.value }))} 
                    placeholder="e.g. Sprint Stale Issue Notification"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">When this event happens (Trigger)</label>
                  <DropdownSelect
                    value={newWorkflow.trigger}
                    onChange={(e) => setNewWorkflow(w => ({ ...w, trigger: e.value }))}
                    options={[
                      { label: 'When new task is created', value: 'When new task is created' },
                      { label: 'When priority changes to Urgent/High', value: 'When priority changes to Urgent/High' },
                      { label: 'When issue status moves to Review', value: 'When issue status moves to Review' },
                      { label: 'When time logged exceeds project estimate', value: 'When time logged exceeds project estimate' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Do this action automatically</label>
                  <DropdownSelect
                    value={newWorkflow.action}
                    onChange={(e) => setNewWorkflow(w => ({ ...w, action: e.value }))}
                    options={[
                      { label: 'Send notification to assigned team', value: 'Send notification to assigned team' },
                      { label: 'Assign to Engineering Lead & Slack Alert', value: 'Assign to Engineering Lead & Slack Alert' },
                      { label: 'Tag issue with #needs-attention & notify QA', value: 'Tag issue with #needs-attention & notify QA' },
                      { label: 'Send weekly status report via email', value: 'Send weekly status report via email' },
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" onClick={() => setShowNewWorkflowModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddAutomation}>
                  Activate Workflow
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageLayout>
  );
}

