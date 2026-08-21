import React from 'react';
import {
  Sparkles,
  Zap,
  Trash2,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { EmailAccount, CleanRule, EmailMessage, CleanHistoryLog, AppSettings } from '../types/index.ts';
import { previewCleaning } from '../services/mailCleanerEngine.ts';

interface DashboardViewProps {
  accounts: EmailAccount[];
  rules: CleanRule[];
  emails: EmailMessage[];
  logs: CleanHistoryLog[];
  settings: AppSettings;
  onTriggerClean: () => void;
  onNavigateTab: (tab: 'rules' | 'accounts' | 'trash') => void;
  onOpenNewRuleModal: () => void;
  onSimulateDailyRun: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  rules,
  emails,
  logs,
  settings,
  onTriggerClean,
  onNavigateTab,
  onOpenNewRuleModal,
  onSimulateDailyRun
}) => {
  const enabledRules = rules.filter(r => r.isEnabled);
  const preview = previewCleaning(emails, rules);

  const totalCleanedEmails = logs.reduce((acc, l) => acc + l.emailsCleaned, 0);
  const totalFreedMb = logs.reduce((acc, l) => acc + l.storageFreedMb, 0);
  const trashedCount = emails.filter(e => e.status === 'trashed').length;

  const formatStorage = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${Math.round(mb)} MB`;
  };

  const getProviderIconColor = (provider: string) => {
    switch (provider) {
      case 'gmail': return '#ea4335';
      case 'outlook': return '#0078d4';
      case 'libero': return '#ffcc00';
      case 'yahoo': return '#6001d2';
      default: return '#6366f1';
    }
  };

  return (
    <div className="screen-content">
      {/* Hero Action Card */}
      <div className="glass-card hero-clean-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <span className="pill-badge pill-primary" style={{ marginBottom: '6px' }}>
              <Zap size={11} />
              <span>PULIZIA INTELLIGENTE</span>
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              Centro di Pulizia
            </h2>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <Clock size={12} color="#38bdf8" />
            <span>{settings.autoCleanEnabled ? `Auto: ${settings.scheduledTime}` : 'Auto: Disattivata'}</span>
          </div>
        </div>

        {enabledRules.length === 0 ? (
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '14px',
            border: '1px dashed rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertCircle size={16} color="#f59e0b" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                Nessun filtro configurato
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Per avviare la pulizia automatica o manuale, crea la tua prima regola personalizzata (es. elimina newsletter più vecchie di 15 giorni).
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email da pulire rilevate:</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#6ee7b7' }}>
                {preview.totalEmailsToClean} messaggi <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)' }}>({preview.totalStorageFreedMb} MB)</span>
              </div>
            </div>
            <span className="pill-badge pill-success">
              {enabledRules.length} {enabledRules.length === 1 ? 'regola attiva' : 'regole attive'}
            </span>
          </div>
        )}

        {enabledRules.length > 0 ? (
          <button
            className="pulse-clean-btn"
            onClick={onTriggerClean}
            disabled={preview.totalEmailsToClean === 0}
            style={{
              opacity: preview.totalEmailsToClean === 0 ? 0.6 : 1,
              cursor: preview.totalEmailsToClean === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Sparkles size={18} />
            <span>
              {preview.totalEmailsToClean > 0
                ? `Pulisci Ora (${preview.totalEmailsToClean} email)`
                : 'Tutto Pulito! Nessuna email da rimuovere'}
            </span>
          </button>
        ) : (
          <button
            className="pulse-clean-btn"
            onClick={onOpenNewRuleModal}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <PlusCircle size={18} />
            <span>Crea la Tua Prima Regola</span>
          </button>
        )}

        {/* Safe Trash indicator note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '11px',
          color: '#94a3b8'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span><strong>Cestino Sicuro Attivo:</strong> le email eliminate sono sempre ripristinabili.</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {/* Metric 1 */}
        <div className="glass-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 6px auto',
            color: '#818cf8'
          }}>
            <Trash2 size={15} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            {totalCleanedEmails + trashedCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
            Email Rimosse
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 6px auto',
            color: '#34d399'
          }}>
            <HardDrive size={15} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            {formatStorage(totalFreedMb + (trashedCount * 0.22))}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
            Spazio Liberato
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card" style={{ padding: '12px 10px', textAlign: 'center' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 6px auto',
            color: '#fbbf24'
          }}>
            <Zap size={15} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            {enabledRules.length} / {rules.length}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>
            Regole Attive
          </div>
        </div>
      </div>

      {/* Connected Accounts Quick List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
            Caselle Collegate ({accounts.length})
          </h3>
          <button
            onClick={() => onNavigateTab('accounts')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <span>Gestisci</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="glass-card glass-card-interactive"
              onClick={() => onNavigateTab('accounts')}
              style={{
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${getProviderIconColor(acc.provider)}22`,
                  border: `1px solid ${getProviderIconColor(acc.provider)}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: getProviderIconColor(acc.provider)
                }}>
                  {acc.provider === 'gmail' ? 'G' : acc.provider === 'outlook' ? 'O' : acc.provider === 'libero' ? 'L' : 'M'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {acc.email}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
                  {acc.totalEmails} email
                </div>
                <div style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                  <CheckCircle2 size={10} />
                  <span>Sincronizzata</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator Test Action */}
      <div className="glass-card" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
              Simulazione Pulizia Automatica
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Testa l'esecuzione notturna schedulata alle {settings.scheduledTime}
            </div>
          </div>
          <button
            onClick={onSimulateDailyRun}
            style={{
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#a5b4fc',
              padding: '7px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <RotateCcw size={12} />
            <span>Simula Cron</span>
          </button>
        </div>
      </div>
    </div>
  );
};
