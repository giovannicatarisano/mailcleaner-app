import React, { useState, useEffect } from 'react';
import { initialAccounts, initialMockEmails } from './data/mockEmails.ts';
import { EmailAccount, CleanRule, EmailMessage, CleanHistoryLog, AppSettings } from './types/index.ts';
import { executeCleanRun, executeManualQuickClean } from './services/mailCleanerEngine.ts';

import { DeviceFrame } from './components/DeviceFrame.tsx';
import { Header } from './components/Header.tsx';
import { BottomNav, NavTab } from './components/BottomNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { RulesView } from './components/RulesView.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { TrashAndLogsView } from './components/TrashAndLogsView.tsx';

import { NewRuleModal } from './components/NewRuleModal.tsx';
import { AddAccountModal } from './components/AddAccountModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { CleaningProgressModal } from './components/CleaningProgressModal.tsx';
import { EmailDetailModal } from './components/EmailDetailModal.tsx';

const DEFAULT_SETTINGS: AppSettings = {
  autoCleanEnabled: true,
  scheduledTime: '03:00',
  defaultAction: 'trash',
  autoEmptyTrashDays: 30,
  notificationsEnabled: true,
  devicePreview: 'fluid'
};

export function App() {
  const [accounts, setAccounts] = useState<EmailAccount[]>(() => {
    const saved = localStorage.getItem('mailcleaner_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      const realAccounts = parsed.filter((a: any) => !a.id.startsWith('acc-gmail') && !a.id.startsWith('acc-libero') && !a.id.startsWith('acc-outlook'));
      return realAccounts;
    }
    return initialAccounts;
  });

  const [rules, setRules] = useState<CleanRule[]>(() => {
    const saved = localStorage.getItem('mailcleaner_rules');
    return saved ? JSON.parse(saved) : [];
  });

  const [emails, setEmails] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem('mailcleaner_emails');
    if (saved) {
      const parsed = JSON.parse(saved);
      const realEmails = parsed.filter((e: any) => !e.id.startsWith('mail-'));
      return realEmails;
    }
    return initialMockEmails;
  });

  const [logs, setLogs] = useState<CleanHistoryLog[]>(() => {
    const saved = localStorage.getItem('mailcleaner_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('mailcleaner_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCleaningOpen, setIsCleaningOpen] = useState(false);
  const [isDailyAutoRun, setIsDailyAutoRun] = useState(false);
  const [selectedEmailForDetail, setSelectedEmailForDetail] = useState<EmailMessage | null>(null);

  const [cleaningSummary, setCleaningSummary] = useState<{
    cleanedCount: number;
    freedMb: number;
    ruleBreakdown: { ruleName: string; count: number }[];
  }>({ cleanedCount: 0, freedMb: 0, ruleBreakdown: [] });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('mailcleaner_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('mailcleaner_rules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('mailcleaner_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('mailcleaner_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('mailcleaner_settings', JSON.stringify(settings));
  }, [settings]);

  // Handlers for Rules
  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleSaveRule = (newRule: CleanRule) => {
    setRules(prev => [newRule, ...prev]);
  };

  const handleAddSuggestedRule = (template: Partial<CleanRule>) => {
    const fullRule: CleanRule = {
      id: `rule-${Date.now()}`,
      name: template.name || 'Regola Consigliata',
      description: template.description,
      isEnabled: true,
      targetAccountIds: 'all',
      conditions: template.conditions || {},
      action: 'trash',
      whitelist: template.whitelist || {
        senders: [],
        protectStarred: true,
        protectReceipts: true
      },
      createdAt: new Date().toISOString(),
      stats: {
        emailsMatched: 0,
        storageFreedMb: 0
      }
    };
    setRules(prev => [fullRule, ...prev]);
  };

  // Handlers for Accounts
  const handleAddAccount = (newAccount: EmailAccount) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleRemoveAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
  };

  const handleSyncAccount = (accountId: string) => {
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? { ...a, lastCleanedAt: 'Proprio adesso', unreadEmails: Math.max(0, a.unreadEmails - 2) }
          : a
      )
    );
  };

  // Cleaning Execution (Manual & Auto)
  const handleTriggerClean = () => {
    handleManualQuickClean('all');
  };

  const handleManualQuickClean = (cleanType: 'all' | 'promotions' | 'old' | 'account' = 'all', targetAccountId?: string) => {
    setIsDailyAutoRun(false);
    const result = executeManualQuickClean(emails, rules, cleanType, targetAccountId);

    setEmails(result.updatedEmails);
    setRules(result.updatedRules);
    if (result.cleanedCount > 0) {
      setLogs(prev => [result.log, ...prev]);
    }

    // Update account stats
    setAccounts(prev => prev.map(a => {
      if (!targetAccountId || a.id === targetAccountId) {
        return {
          ...a,
          lastCleanedAt: 'Proprio adesso',
          totalEmails: Math.max(0, a.totalEmails - result.cleanedCount)
        };
      }
      return a;
    }));

    setCleaningSummary({
      cleanedCount: result.cleanedCount,
      freedMb: result.freedMb,
      ruleBreakdown: result.log.ruleBreakdown
    });

    setIsCleaningOpen(true);
  };

  // Handlers for Trash
  const handleRestoreEmail = (emailId: string) => {
    setEmails(prev =>
      prev.map(e =>
        e.id === emailId
          ? { ...e, status: 'inbox', trashedAt: undefined, matchedRuleId: undefined, matchedRuleName: undefined }
          : e
      )
    );
  };

  const handleEmptyTrash = () => {
    setEmails(prev => prev.filter(e => e.status !== 'trashed'));
  };

  const activeRulesCount = rules.filter(r => r.isEnabled).length;
  const trashedCount = emails.filter(e => e.status === 'trashed').length;

  return (
    <DeviceFrame>
      {/* Top Header con pulsante pulizia rapida manuale */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickClean={accounts.length > 0 ? () => handleManualQuickClean('all') : undefined}
      />

      {/* Screen Views based on Navigation */}
      {currentTab === 'dashboard' && (
        <DashboardView
          accounts={accounts}
          rules={rules}
          emails={emails}
          logs={logs}
          settings={settings}
          onTriggerClean={handleTriggerClean}
          onTriggerQuickClean={type => handleManualQuickClean(type)}
          onNavigateTab={tab => setCurrentTab(tab)}
          onOpenNewRuleModal={() => setIsNewRuleOpen(true)}
          onOpenAddAccountModal={() => setIsAddAccountOpen(true)}
        />
      )}

      {currentTab === 'rules' && (
        <RulesView
          rules={rules}
          emails={emails}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
          onOpenNewRuleModal={() => setIsNewRuleOpen(true)}
          onAddSuggestedRule={handleAddSuggestedRule}
        />
      )}

      {currentTab === 'accounts' && (
        <AccountsView
          accounts={accounts}
          onOpenAddAccount={() => setIsAddAccountOpen(true)}
          onSyncAccount={handleSyncAccount}
          onRemoveAccount={handleRemoveAccount}
          onCleanSingleAccount={accId => handleManualQuickClean('account', accId)}
        />
      )}

      {currentTab === 'trash' && (
        <TrashAndLogsView
          emails={emails}
          logs={logs}
          onRestoreEmail={handleRestoreEmail}
          onEmptyTrash={handleEmptyTrash}
          onSelectEmail={email => setSelectedEmailForDetail(email)}
        />
      )}

      {/* Bottom Nav Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRulesCount={activeRulesCount}
        accountsCount={accounts.length}
        trashedCount={trashedCount}
      />

      {/* Modals */}
      {isNewRuleOpen && (
        <NewRuleModal
          accounts={accounts}
          onClose={() => setIsNewRuleOpen(false)}
          onSaveRule={handleSaveRule}
        />
      )}

      {isAddAccountOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountOpen(false)}
          onAddAccount={handleAddAccount}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isCleaningOpen && (
        <CleaningProgressModal
          accounts={accounts}
          isDailyAutoRun={isDailyAutoRun}
          onComplete={() => setIsCleaningOpen(false)}
          cleaningSummary={cleaningSummary}
        />
      )}

      {selectedEmailForDetail && (
        <EmailDetailModal
          email={selectedEmailForDetail}
          onClose={() => setSelectedEmailForDetail(null)}
          onRestore={handleRestoreEmail}
        />
      )}
    </DeviceFrame>
  );
}
