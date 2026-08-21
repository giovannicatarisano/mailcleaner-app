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
  Mail,
  Tag,
  Calendar
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
  onTriggerQuickClean?: (cleanType: 'all' | 'promotions' | 'old') => void;
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
  onTriggerQuickClean,
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

      {/* ── Hero Card: Centro di Pulizia ────────────────────── */}
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
            Collega la tua casella di posta per iniziare a eliminare automaticamente spam, promozioni e messaggi indesiderati.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto var(--spacing-sm) auto' }}>
            <button
              onClick={onOpenAddAccountModal}
              style={{
                background: '#ffffff',
                color: '#1f2937',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Accedi con Google</span>
            </button>

            <button
              onClick={onOpenAddAccountModal}
              style={{
                background: '#0078d4',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Accedi con Outlook</span>
            </button>

            <button
              onClick={onOpenAddAccountModal}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>Accedi con Libero Mail</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card hero-clean-card">
          {/* Header card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
            <div>
              <span className="pill-badge pill-primary" style={{ marginBottom: 'var(--spacing-xs)', display: 'inline-flex' }}>
                <Zap size={10} />
                <span>PULIZIA MANUALE &amp; AUTOMATICA</span>
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

          {/* Status Box */}
          <div style={{
            background: 'rgba(0,0,0,0.22)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Stato caselle collegate:</div>
              <div style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#6ee7b7' }}>
                {preview.totalEmailsToClean > 0
                  ? `${preview.totalEmailsToClean} email pronte da pulire`
                  : `${accounts.reduce((acc, a) => acc + a.totalEmails, 0)} email monitorate`}
                {preview.totalEmailsToClean > 0 && (
                  <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--text-dim)', marginLeft: '5px' }}>
                    ({preview.totalStorageFreedMb} MB)
                  </span>
                )}
              </div>
            </div>
            <span className="pill-badge pill-success">
              {enabledRules.length} {enabledRules.length === 1 ? 'regola' : 'regole'} attive
            </span>
          </div>

          {/* Primary Action Button — Sempre attivo per pulizia manuale immediata */}
          <button
            className="pulse-clean-btn"
            onClick={onTriggerClean}
            style={{
              cursor: 'pointer',
              marginBottom: 'var(--spacing-xs)',
            }}
          >
            <Sparkles size={17} />
            <span>
              {preview.totalEmailsToClean > 0
                ? `⚡ Avvia Pulizia Manuale Ora (${preview.totalEmailsToClean} email)`
                : `⚡ Avvia Scansione e Pulizia Manuale`}
            </span>
          </button>

          {/* Footer note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: 'var(--spacing-xs)', fontSize: 'var(--font-xs)', color: '#94a3b8' }}>
            <ShieldCheck size={13} color="#10b981" />
            <span><strong>Cestino Sicuro:</strong> le email eliminate sono recuperabili per 30 giorni.</span>
          </div>
        </div>
      )}

      {/* ── Azioni Rapide di Pulizia Manuale su Richiesta ────── */}
      {accounts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
            <h3 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={13} color="#f59e0b" />
              <span>Pulizia Rapida su Richiesta</span>
            </h3>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>1-Tap Clean</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-xs)' }}>
            {/* Opzione 1: Pulisci Tutto */}
            <button
              onClick={() => onTriggerQuickClean ? onTriggerQuickClean('all') : onTriggerClean()}
              className="glass-card glass-card-interactive"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-xs)',
                textAlign: 'center',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                background: 'rgba(99, 102, 241, 0.08)',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <div style={{
                width: 'clamp(26px, 3.8dvh, 32px)',
                height: 'clamp(26px, 3.8dvh, 32px)',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-xs) auto',
                color: '#818cf8'
              }}>
                <Sparkles size={14} />
              </div>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Pulisci Tutto
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Tutti i filtri
              </div>
            </button>

            {/* Opzione 2: Promozioni */}
            <button
              onClick={() => onTriggerQuickClean ? onTriggerQuickClean('promotions') : onTriggerClean()}
              className="glass-card glass-card-interactive"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-xs)',
                textAlign: 'center',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                background: 'rgba(245, 158, 11, 0.08)',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <div style={{
                width: 'clamp(26px, 3.8dvh, 32px)',
                height: 'clamp(26px, 3.8dvh, 32px)',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-xs) auto',
                color: '#fbbf24'
              }}>
                <Tag size={14} />
              </div>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Solo Promo
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Newsletter &amp; Saldi
              </div>
            </button>

            {/* Opzione 3: Posta Vecchia */}
            <button
              onClick={() => onTriggerQuickClean ? onTriggerQuickClean('old') : onTriggerClean()}
              className="glass-card glass-card-interactive"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-xs)',
                textAlign: 'center',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                background: 'rgba(16, 185, 129, 0.08)',
                cursor: 'pointer',
                color: '#fff',
              }}
            >
              <div style={{
                width: 'clamp(26px, 3.8dvh, 32px)',
                height: 'clamp(26px, 3.8dvh, 32px)',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-xs) auto',
                color: '#34d399'
              }}>
                <Calendar size={14} />
              </div>
              <div style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                Posta &gt; 30gg
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Email vecchie
              </div>
            </button>
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
