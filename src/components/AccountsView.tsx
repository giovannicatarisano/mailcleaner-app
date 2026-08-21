import React, { useState } from 'react';
import { Plus, RefreshCw, Mail, CheckCircle2, Shield, Trash, ExternalLink, HardDrive, Key } from 'lucide-react';
import { EmailAccount } from '../types/index.ts';

interface AccountsViewProps {
  accounts: EmailAccount[];
  onOpenAddAccount: () => void;
  onSyncAccount: (accountId: string) => void;
  onRemoveAccount: (accountId: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onOpenAddAccount,
  onSyncAccount,
  onRemoveAccount
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setSyncingId(id);
    onSyncAccount(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return { name: 'Google OAuth 2.0', color: '#ea4335', bg: 'rgba(234, 67, 53, 0.15)' };
      case 'outlook':
        return { name: 'Microsoft Graph', color: '#0078d4', bg: 'rgba(0, 120, 212, 0.15)' };
      case 'libero':
        return { name: 'IMAP SSL (Libero)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      default:
        return { name: 'IMAP Protocol', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' };
    }
  };

  return (
    <div className="screen-content">
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            Caselle Collegate ({accounts.length})
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Gestisci gli account email da sincronizzare e pulire
          </p>
        </div>

        <button
          onClick={onOpenAddAccount}
          style={{
            background: 'var(--primary-gradient)',
            border: 'none',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}
        >
          <Plus size={15} />
          <span>Aggiungi</span>
        </button>
      </div>

      {/* Account Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {accounts.map(acc => {
          const badge = getProviderBadge(acc.provider);
          const isSyncing = syncingId === acc.id;

          return (
            <div key={acc.id} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: badge.bg,
                    border: `1px solid ${badge.color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                    color: badge.color
                  }}>
                    {acc.provider === 'gmail' ? 'G' : acc.provider === 'outlook' ? 'O' : acc.provider === 'libero' ? 'L' : 'M'}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                      {acc.email}
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: badge.color,
                  background: badge.bg,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  border: `1px solid ${badge.color}33`
                }}>
                  {badge.name}
                </span>
              </div>

              {/* Status and storage bar */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Email Totali</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>{acc.totalEmails}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Non Lette</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>{acc.unreadEmails}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Spazio Usato</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>{(acc.storageUsedMb / 1024).toFixed(1)} GB</div>
                </div>
              </div>

              {/* Account Foot Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} color="#10b981" />
                  <span>Ultima pulizia: {acc.lastCleanedAt || 'Mai'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => handleSync(acc.id)}
                    disabled={isSyncing}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      color: '#a5b4fc',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Sync...' : 'Sincronizza'}</span>
                  </button>

                  <button
                    onClick={() => onRemoveAccount(acc.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      padding: '6px',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    title="Disconnetti account"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security notice card */}
      <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <Shield size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
              Crittografia e Privacy Assoluta
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              I token di autenticazione e le credenziali IMAP sono protetti tramite Secure Storage e crittografia AES-256. MailCleaner non memorizza i contenuti delle tue email su server esterni.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
