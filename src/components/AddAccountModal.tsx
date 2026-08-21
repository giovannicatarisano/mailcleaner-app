import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Lock, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { EmailAccount, EmailProvider } from '../types/index.ts';

interface AddAccountModalProps {
  onClose: () => void;
  onAddAccount: (account: EmailAccount) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  onClose,
  onAddAccount
}) => {
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider>('gmail');
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('imapmail.libero.it');
  const [imapPort, setImapPort] = useState(993);
  const [useSsl, setUseSsl] = useState(true);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider);
    setErrorMsg(null);
    if (provider === 'libero') {
      setImapHost('imapmail.libero.it');
      setImapPort(993);
      if (!email.includes('@libero.it')) setEmail('mario.rossi@libero.it');
      setAccountName('Libero Mail');
    } else if (provider === 'gmail') {
      setEmail('mario.rossi@gmail.com');
      setAccountName('Gmail Personale');
    } else if (provider === 'outlook') {
      setEmail('mario.rossi@outlook.it');
      setAccountName('Outlook Posta');
    } else {
      setImapHost('mail.provider.it');
      setImapPort(993);
      setAccountName('Email IMAP');
    }
  };

  const handleConnect = () => {
    if (!email.trim()) {
      setErrorMsg('Inserisci un indirizzo email valido');
      return;
    }

    setIsConnecting(true);
    setErrorMsg(null);

    // Simulate authenticating and fetching inbox stats
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionSuccess(true);

      setTimeout(() => {
        const newAccount: EmailAccount = {
          id: `acc-${Date.now()}`,
          email: email.trim(),
          provider: selectedProvider,
          name: accountName.trim() || email.split('@')[0],
          status: 'connected',
          totalEmails: Math.floor(Math.random() * 800) + 400,
          unreadEmails: Math.floor(Math.random() * 80) + 20,
          storageUsedMb: Math.floor(Math.random() * 2000) + 500,
          lastCleanedAt: 'Mai',
          imapHost: selectedProvider === 'libero' || selectedProvider === 'imap' ? imapHost : undefined,
          imapPort: selectedProvider === 'libero' || selectedProvider === 'imap' ? imapPort : undefined,
          useSsl
        };

        onAddAccount(newAccount);
        onClose();
      }, 700);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Mail size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                Collega Nuova Casella Email
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Seleziona il provider per sincronizzare la posta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Provider Selector Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
          {[
            { id: 'gmail', name: 'Gmail', color: '#ea4335', icon: 'G' },
            { id: 'outlook', name: 'Outlook', color: '#0078d4', icon: 'O' },
            { id: 'libero', name: 'Libero', color: '#f59e0b', icon: 'L' },
            { id: 'imap', name: 'IMAP', color: '#8b5cf6', icon: '⚡' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handleProviderSelect(p.id as EmailProvider)}
              style={{
                background: selectedProvider === p.id ? `${p.color}22` : 'rgba(255, 255, 255, 0.04)',
                border: '1px solid ' + (selectedProvider === p.id ? p.color : 'var(--border-subtle)'),
                borderRadius: '14px',
                padding: '12px 6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `${p.color}33`,
                color: p.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px'
              }}>
                {p.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: selectedProvider === p.id ? '#fff' : 'var(--text-muted)' }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#fda4af'
          }}>
            {errorMsg}
          </div>
        )}

        {/* OAuth Provider View (Gmail & Outlook) */}
        {(selectedProvider === 'gmail' || selectedProvider === 'outlook') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: selectedProvider === 'gmail' ? 'rgba(234, 67, 53, 0.15)' : 'rgba(0, 120, 212, 0.15)',
                color: selectedProvider === 'gmail' ? '#ea4335' : '#0078d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                fontWeight: 800,
                fontSize: '18px'
              }}>
                {selectedProvider === 'gmail' ? 'G' : 'O'}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                Accesso Sicuro tramite {selectedProvider === 'gmail' ? 'Google' : 'Microsoft'} OAuth 2.0
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Non serve inserire la tua password. Verrà generato un token di accesso limitato per la scansione e la pulizia della posta.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Indirizzo Email
              </label>
              <input
                type="email"
                placeholder={selectedProvider === 'gmail' ? 'iltuonome@gmail.com' : 'iltuonome@outlook.it'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* IMAP Provider View (Libero Mail / Custom) */}
        {(selectedProvider === 'libero' || selectedProvider === 'imap') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Indirizzo Email {selectedProvider === 'libero' ? 'Libero' : 'IMAP'}
              </label>
              <input
                type="email"
                placeholder={selectedProvider === 'libero' ? 'mario.rossi@libero.it' : 'email@dominio.it'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Password o App Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Server IMAP
                </label>
                <input
                  type="text"
                  value={imapHost}
                  onChange={e => setImapHost(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Porta SSL
                </label>
                <input
                  type="number"
                  value={imapPort}
                  onChange={e => setImapPort(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          margin: '14px 0',
          fontSize: '11px',
          color: '#10b981'
        }}>
          <ShieldCheck size={14} />
          <span>Connessione crittografata TLS/SSL verificata</span>
        </div>

        {/* Submit action */}
        <button
          className="pulse-clean-btn"
          onClick={handleConnect}
          disabled={isConnecting || connectionSuccess}
          style={{
            background: connectionSuccess ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'var(--primary-gradient)'
          }}
        >
          {isConnecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifica e Connessione in corso...</span>
            </>
          ) : connectionSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Casella Connessa con Successo!</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Collega Casella Ora</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
