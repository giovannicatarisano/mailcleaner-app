import React, { useState } from 'react';
import { Plus, RefreshCw, CheckCircle2, Shield, Trash, Sparkles } from 'lucide-react';
import { EmailAccount } from '../types/index.ts';

interface AccountsViewProps {
  accounts: EmailAccount[];
  onOpenAddAccount: () => void;
  onSyncAccount: (accountId: string) => void;
  onRemoveAccount: (accountId: string) => void;
  onCleanSingleAccount?: (accountId: string) => void;
}

const getProviderBadge = (provider: string) => {
  switch (provider) {
    case 'gmail':   return { name: 'Google OAuth 2.0',   color: '#ea4335', bg: 'rgba(234,67,53,0.15)',   letter: 'G' };
    case 'outlook': return { name: 'Microsoft Graph',    color: '#0078d4', bg: 'rgba(0,120,212,0.15)',   letter: 'O' };
    case 'libero':  return { name: 'IMAP SSL (Libero)',  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', letter: 'L' };
    default:        return { name: 'IMAP Protocol',      color: '#6366f1', bg: 'rgba(99,102,241,0.15)', letter: 'M' };
  }
};

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onOpenAddAccount,
  onSyncAccount,
  onRemoveAccount,
  onCleanSingleAccount,
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    onSyncAccount(id);
    setTimeout(() => setSyncingId(null), 1200);
  };

  return (
    <div className="screen-content">

      {/* ── Intestazione ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#fff' }}>
            Caselle Collegate ({accounts.length})
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            Gestisci e pulisci individualmente le tue caselle email
          </p>
        </div>
        <button
          onClick={onOpenAddAccount}
          style={{
            background: 'var(--primary-gradient)',
            border: 'none',
            color: '#fff',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-xs)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            boxShadow: '0 4px 12px var(--primary-glow)',
          }}
        >
          <Plus size={14} />
          <span>Aggiungi</span>
        </button>
      </div>

      {/* ── Nessun account ────────────────────────────────── */}
      {accounts.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
            Nessuna casella collegata. Aggiungi il tuo primo account per iniziare.
          </p>
          <button className="pulse-clean-btn" onClick={onOpenAddAccount} style={{ maxWidth: '240px', margin: '0 auto' }}>
            <Plus size={15} />
            <span>Collega Account Email</span>
          </button>
        </div>
      )}

      {/* ── Lista account ─────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        {accounts.map(acc => {
          const badge = getProviderBadge(acc.provider);
          const isSyncing = syncingId === acc.id;

          return (
            <div key={acc.id} className="glass-card">
              {/* Riga principale: logo + info + badge protocollo */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', minWidth: 0 }}>
                  <div style={{
                    width: 'clamp(36px, 5.5dvh, 44px)',
                    height: 'clamp(36px, 5.5dvh, 44px)',
                    borderRadius: '12px',
                    background: badge.bg,
                    border: `1px solid ${badge.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-md)',
                    fontWeight: 800,
                    color: badge.color,
                    flexShrink: 0,
                  }}>
                    {badge.letter}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {acc.email}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  color: badge.color,
                  background: badge.bg,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: `1px solid ${badge.color}33`,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {badge.name}
                </span>
              </div>

              {/* Statistiche account */}
              <div style={{
                background: 'rgba(0,0,0,0.22)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                marginBottom: 'var(--spacing-sm)',
              }}>
                {[
                  { label: 'Email Totali', value: acc.totalEmails, color: '#e2e8f0' },
                  { label: 'Non Lette',    value: acc.unreadEmails, color: '#fbbf24' },
                  { label: 'Spazio Usato', value: `${(acc.storageUsedMb / 1024).toFixed(1)} GB`, color: '#38bdf8' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>{s.label}</div>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Footer azioni: Pulizia Rapida Casella + Sync + Elimina */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={11} color="#10b981" />
                  <span>Ultima: {acc.lastCleanedAt || 'Mai'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                  {/* Tasto Pulizia Manuale per Singola Casella */}
                  {onCleanSingleAccount && (
                    <button
                      onClick={() => onCleanSingleAccount(acc.id)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: '#a5b4fc',
                        padding: '5px 10px',
                        borderRadius: '8px',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Pulisci subito questa casella"
                    >
                      <Sparkles size={11} />
                      <span>Pulisci Casella</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleSync(acc.id)}
                    disabled={isSyncing}
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid var(--border-subtle)',
                      color: '#cbd5e1',
                      padding: '5px 9px',
                      borderRadius: '8px',
                      fontSize: 'var(--font-xs)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={11} />
                    <span>{isSyncing ? 'Sync...' : 'Sync'}</span>
                  </button>

                  <button
                    onClick={() => onRemoveAccount(acc.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      padding: '5px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Disconnetti account"
                  >
                    <Trash size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Nota sicurezza ────────────────────────────────── */}
      <div className="glass-card" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
          <Shield size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>
              Crittografia e Privacy Assoluta
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              I token di autenticazione sono protetti tramite Secure Storage e crittografia AES-256. MailCleaner non memorizza i contenuti delle email su server esterni.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
