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
  CheckCircle2,
  AlertCircle,
  Mail
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
  onOpenAddAccountModal: () => void;
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
  onOpenAddAccountModal,
}) => {
  const enabledRules = rules.filter(r => r.isEnabled);
  const preview = previewCleaning(emails, rules);

  const totalCleanedEmails = logs.reduce((acc, l) => acc + l.emailsCleaned, 0);
  const totalFreedMb = logs.reduce((acc, l) => acc + l.storageFreedMb, 0);
  const trashedCount = emails.filter(e => e.status === 'trashed').length;

  const formatStorage = (mb: number): string => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${Math.round(mb)} MB`;
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gmail':   return '#ea4335';
      case 'outlook': return '#0078d4';
      case 'libero':  return '#ffcc00';
      case 'yahoo':   return '#6001d2';
      default:        return '#6366f1';
    }
  };

  const getProviderLetter = (provider: string) => {
    switch (provider) {
      case 'gmail':   return 'G';
      case 'outlook': return 'O';
      case 'libero':  return 'L';
      default:        return 'M';
    }
  };

  return (
    <div className="screen-content">

      {/* ── Hero Card ──────────────────────────────────────── */}
      {accounts.length === 0 ? (
        <div className="glass-card hero-clean-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 'clamp(44px, 7dvh, 58px)',
            height: 'clamp(44px, 7dvh, 58px)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-sm) auto',
            color: '#818cf8',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.25)',
          }}>
            <Mail size={26} />
          </div>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
            Benvenuto su MailCleaner
          </h2>
          <p style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: 'var(--spacing-md)',
          }}>
            Collega la tua prima casella per iniziare a eliminare automaticamente le email indesiderate.
          </p>
          <button
            className="pulse-clean-btn"
            onClick={onOpenAddAccountModal}
            style={{ maxWidth: '280px', margin: '0 auto' }}
          >
            <PlusCircle size={16} />
            <span>Collega Casella Email</span>
          </button>
        </div>
      ) : (
        <div className="glass-card hero-clean-card">
          {/* Header card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            <div>
              <span className="pill-badge pill-primary" style={{ marginBottom: 'var(--spacing-xs)', display: 'inline-flex' }}>
                <Zap size={10} />
                <span>PULIZIA INTELLIGENTE</span>
              </span>
              <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#fff' }}>
                Centro di Pulizia
              </h2>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-sm)',
              padding: '5px 9px',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}>
              <Clock size={11} color="#38bdf8" />
              <span>{settings.autoCleanEnabled ? `Auto: ${settings.scheduledTime}` : 'Auto: Off'}</span>
            </div>
          </div>

          {/* Preview / Warning */}
          {enabledRules.length === 0 ? (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)',
              border: '1px dashed rgba(255,255,255,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                <AlertCircle size={15} color="#f59e0b" />
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fbbf24' }}>Nessun filtro configurato</span>
              </div>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Crea la tua prima regola personalizzata per avviare la pulizia automatica.
              </p>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.22)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm) var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Email da pulire:</div>
                <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#6ee7b7' }}>
                  {preview.totalEmailsToClean}
                  <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--text-dim)', marginLeft: '5px' }}>
                    ({preview.totalStorageFreedMb} MB)
                  </span>
                </div>
              </div>
              <span className="pill-badge pill-success">
                {enabledRules.length} {enabledRules.length === 1 ? 'regola' : 'regole'} attive
              </span>
            </div>
          )}

          {/* CTA */}
          {enabledRules.length > 0 ? (
            <button
              className="pulse-clean-btn"
              onClick={onTriggerClean}
              disabled={preview.totalEmailsToClean === 0}
              style={{ opacity: preview.totalEmailsToClean === 0 ? 0.6 : 1 }}
            >
              <Sparkles size={16} />
              <span>
                {preview.totalEmailsToClean > 0
                  ? `Pulisci Ora (${preview.totalEmailsToClean} email)`
                  : 'Tutto Pulito!'}
              </span>
            </button>
          ) : (
            <button
              className="pulse-clean-btn"
              onClick={onOpenNewRuleModal}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <PlusCircle size={16} />
              <span>Crea Nuova Regola</span>
            </button>
          )}

          {/* Footer note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-xs)', color: '#94a3b8' }}>
            <ShieldCheck size={13} color="#10b981" />
            <span><strong>Cestino Sicuro:</strong> le email eliminate sono recuperabili per 30 giorni.</span>
          </div>
        </div>
      )}

      {/* ── Metriche ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-xs)' }}>
        {[
          { icon: <Trash2 size={14} />, value: totalCleanedEmails + trashedCount, label: 'Rimosse', color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
          { icon: <HardDrive size={14} />, value: formatStorage(totalFreedMb + trashedCount * 0.22), label: 'Spazio', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
          { icon: <Zap size={14} />, value: `${enabledRules.length}/${rules.length}`, label: 'Regole', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
        ].map((m, i) => (
          <div key={i} className="glass-card" style={{ padding: 'var(--spacing-sm) var(--spacing-xs)', textAlign: 'center' }}>
            <div style={{
              width: 'clamp(24px, 3.5dvh, 30px)',
              height: 'clamp(24px, 3.5dvh, 30px)',
              borderRadius: '8px',
              background: m.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-xs) auto',
              color: m.color,
            }}>
              {m.icon}
            </div>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff' }}>{m.value}</div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', fontWeight: 600 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Caselle Collegate ───────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
          <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)' }}>
            Caselle Collegate ({accounts.length})
          </h3>
          <button
            onClick={() => onNavigateTab('accounts')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#818cf8',
              fontSize: 'var(--font-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>{accounts.length === 0 ? '+ Aggiungi' : 'Gestisci'}</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div
            className="glass-card glass-card-interactive"
            onClick={onOpenAddAccountModal}
            style={{ textAlign: 'center', border: '1px dashed var(--border-subtle)' }}
          >
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#818cf8' }}>
              + Collega Gmail, Libero Mail o Outlook
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            {accounts.map(acc => {
              const color = getProviderColor(acc.provider);
              return (
                <div
                  key={acc.id}
                  className="glass-card glass-card-interactive"
                  onClick={() => onNavigateTab('accounts')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <div style={{
                      width: 'clamp(32px, 4.5dvh, 38px)',
                      height: 'clamp(32px, 4.5dvh, 38px)',
                      borderRadius: '10px',
                      background: `${color}20`,
                      border: `1px solid ${color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 'var(--font-sm)',
                      color,
                      flexShrink: 0,
                    }}>
                      {getProviderLetter(acc.provider)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--spacing-xs)' }}>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: '#e2e8f0' }}>{acc.totalEmails} email</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                      <CheckCircle2 size={10} />
                      <span>Connessa</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
