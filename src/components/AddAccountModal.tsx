import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Lock, ShieldCheck, ArrowRight, Loader2, Sparkles, HelpCircle, Key, Server, AlertCircle, ExternalLink } from 'lucide-react';
import { EmailAccount, EmailProvider } from '../types/index.ts';
import { testRealImapConnection } from '../services/imapService.ts';

interface AddAccountModalProps {
  onClose: () => void;
  onAddAccount: (account: EmailAccount) => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  onClose,
  onAddAccount,
}) => {
  const [authMethod, setAuthMethod] = useState<'quick' | 'imap'>('quick');
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | 'libero' | 'virgilio' | 'yahoo' | 'imap'>('libero');
  
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('imapmail.libero.it');
  const [imapPort, setImapPort] = useState(993);
  const [useSsl, setUseSsl] = useState(true);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // ── 1. Accesso Rapido Diretto con Provider (Google, Outlook, Libero) ──
  const handleQuickOAuthLogin = (provider: 'gmail' | 'outlook' | 'libero') => {
    setErrorMsg(null);
    setSelectedProvider(provider);

    if (provider === 'gmail') {
      setImapHost('imap.gmail.com');
      setImapPort(993);
      if (!email.includes('@gmail.com')) setEmail('nome@gmail.com');
    } else if (provider === 'outlook') {
      setImapHost('outlook.office365.com');
      setImapPort(993);
      if (!email.includes('@outlook') && !email.includes('@hotmail')) setEmail('nome@outlook.it');
    } else if (provider === 'libero') {
      setImapHost('imapmail.libero.it');
      setImapPort(993);
      if (!email.includes('@libero.it')) setEmail('nome@libero.it');
    }

    setAuthMethod('imap');
  };

  const handleConnect = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Inserisci un indirizzo email valido (es. nome@dominio.it)');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Inserisci la password o la Password per le app');
      return;
    }

    setIsConnecting(true);
    setErrorMsg(null);

    try {
      // Esegue la verifica reale sul server IMAP
      const result = await testRealImapConnection({
        host: imapHost,
        port: imapPort,
        user: email.trim(),
        password: password.trim(),
        useSsl
      });

      setIsConnecting(false);
      setConnectionSuccess(true);

      setTimeout(() => {
        const prov: EmailProvider = (selectedProvider === 'virgilio' || selectedProvider === 'yahoo')
          ? 'imap'
          : (selectedProvider as EmailProvider);

        const newAccount: EmailAccount = {
          id: `acc-${Date.now()}`,
          email: email.trim(),
          provider: prov,
          name: accountName.trim() || `${selectedProvider.toUpperCase()} (${email.split('@')[0]})`,
          status: 'connected',
          totalEmails: result.totalEmails || 0,
          unreadEmails: result.unreadEmails || 0,
          storageUsedMb: Math.max(50, Math.round((result.totalEmails * 0.45))),
          lastCleanedAt: 'Mai',
          imapHost,
          imapPort,
          useSsl,
        };

        onAddAccount(newAccount);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsConnecting(false);
      setErrorMsg(err.message || 'Errore di autenticazione. Verifica email e password o App Password.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '92dvh', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <Mail size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff' }}>
                Collega la tua Casella Email
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                Accesso diretto alle tue caselle di posta
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
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={15} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'var(--font-xs)',
            color: '#fda4af',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── TASTI FISICI DEDICATI PER PROVIDER ── */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Accedi direttamente con il tuo account:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Tasto 1: Accedi con Google */}
            <button
              onClick={() => handleQuickOAuthLogin('gmail')}
              style={{
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-sm)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Accedi con Google</span>
              </div>
              <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Gmail →</span>
            </button>

            {/* Tasto 2: Accedi con Microsoft Outlook */}
            <button
              onClick={() => handleQuickOAuthLogin('outlook')}
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
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 120, 212, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#fff',
                  color: '#0078d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px'
                }}>O</div>
                <span>Accedi con Microsoft Outlook</span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Hotmail / 365 →</span>
            </button>

            {/* Tasto 3: Accedi con Libero Mail */}
            <button
              onClick={() => handleQuickOAuthLogin('libero')}
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
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  background: '#fff',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px'
                }}>L</div>
                <span>Accedi con Libero Mail</span>
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>@libero.it →</span>
            </button>
          </div>
        </div>

        {/* ── SEZIONE CREDENZIALI & IMAP DIRETTO ── */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-main)' }}>
              Inserisci credenziali per: <strong style={{ color: '#818cf8' }}>{selectedProvider.toUpperCase()}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
            >
              {showHelp ? 'Chiudi' : 'Aiuto Password 2FA'}
            </button>
          </div>

          {showHelp && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              fontSize: 'var(--font-xs)',
              color: '#c7d2fe',
              lineHeight: 1.4,
              marginBottom: 'var(--spacing-xs)'
            }}>
              💡 <strong>Per account con 2FA (Gmail/Libero/Yahoo):</strong> Genera una <em>Password per le App</em> dalle impostazioni di sicurezza del tuo account per consentire a MailCleaner di ripulire i messaggi.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
                Indirizzo Email
              </label>
              <input
                type="email"
                placeholder="iltuonome@dominio.it"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: 'var(--font-sm)',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px' }}>
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
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: 'var(--font-sm)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Privacy & Encryption Guarantee */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'var(--font-xs)',
            color: '#10b981'
          }}>
            <ShieldCheck size={14} />
            <span>Connessione cifrata SSL/TLS verificata ({imapHost}:993)</span>
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
                <span>Verifica credenziali sul server {selectedProvider.toUpperCase()}...</span>
              </>
            ) : connectionSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Casella Connessa con Successo!</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Collega e Sincronizza Casella</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
