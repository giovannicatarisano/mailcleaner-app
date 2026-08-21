import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ShieldCheck, Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';
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

  // ── Selezione Rapida Provider ──
  const handleSelectProvider = (provider: 'gmail' | 'outlook' | 'libero') => {
    setErrorMsg(null);
    setSelectedProvider(provider);

    if (provider === 'gmail') {
      setImapHost('imap.gmail.com');
      setImapPort(993);
    } else if (provider === 'outlook') {
      setImapHost('outlook.office365.com');
      setImapPort(993);
    } else if (provider === 'libero') {
      setImapHost('imapmail.libero.it');
      setImapPort(993);
    }
  };

  const getPlaceholderEmail = () => {
    switch (selectedProvider) {
      case 'gmail': return 'tuonome@gmail.com';
      case 'outlook': return 'tuonome@outlook.it';
      case 'libero': return 'tuonome@libero.it';
      default: return 'tuonome@dominio.it';
    }
  };

  const handleConnect = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Inserisci il tuo reale indirizzo email completo (es. mario.rossi@libero.it)');
      return;
    }

    if (!trimmedPassword) {
      setErrorMsg('Inserisci la password della tua casella di posta.');
      return;
    }

    setIsConnecting(true);
    setErrorMsg(null);

    try {
      // Esegue la verifica reale sul server IMAP
      const result = await testRealImapConnection({
        host: imapHost,
        port: imapPort,
        user: trimmedEmail,
        password: trimmedPassword,
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
          email: trimmedEmail,
          provider: prov,
          name: accountName.trim() || `${selectedProvider.toUpperCase()} (${trimmedEmail.split('@')[0]})`,
          status: 'connected',
          totalEmails: result.totalEmails || 0,
          unreadEmails: result.unreadEmails || 0,
          storageUsedMb: result.totalEmails > 0 ? Math.max(10, Math.round(result.totalEmails * 0.45)) : 0,
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
      setErrorMsg(err.message || 'Errore di connessione o credenziali non corrette.');
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
                Accesso diretto alle tue caselle di posta reali
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
            padding: '10px 12px',
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'var(--font-xs)',
            color: '#fda4af',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── TASTI FISICI DEDICATI PER PROVIDER ── */}
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            1. Scegli il tuo gestore email:
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {/* Tasto 1: Libero Mail */}
            <button
              type="button"
              onClick={() => handleSelectProvider('libero')}
              style={{
                background: selectedProvider === 'libero' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: selectedProvider === 'libero' ? '2px solid #fbbf24' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#fff',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px'
              }}>L</div>
              <span>Libero</span>
            </button>

            {/* Tasto 2: Google Gmail */}
            <button
              type="button"
              onClick={() => handleSelectProvider('gmail')}
              style={{
                background: selectedProvider === 'gmail' ? '#ffffff' : 'rgba(255, 255, 255, 0.06)',
                color: selectedProvider === 'gmail' ? '#1f2937' : '#ffffff',
                border: selectedProvider === 'gmail' ? '2px solid #60a5fa' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Gmail</span>
            </button>

            {/* Tasto 3: Microsoft Outlook */}
            <button
              type="button"
              onClick={() => handleSelectProvider('outlook')}
              style={{
                background: selectedProvider === 'outlook' ? '#0078d4' : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                border: selectedProvider === 'outlook' ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 6px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: '#fff',
                color: '#0078d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '13px'
              }}>O</div>
              <span>Outlook</span>
            </button>
          </div>
        </div>

        {/* ── GUIDA RAPIDA PROVIDER ── */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          fontSize: '11px',
          color: '#c7d2fe',
          lineHeight: 1.4,
          marginBottom: 'var(--spacing-sm)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <Info size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#818cf8' }} />
          <div>
            {selectedProvider === 'libero' && (
              <span><strong>Libero Mail:</strong> Inserisci la tua email <code>@libero.it</code> e la tua password. Se usi la "Password Sicura", genera una password per le app dal sito di Libero.</span>
            )}
            {selectedProvider === 'gmail' && (
              <span><strong>Google Gmail:</strong> Google richiede una <strong>"Password per le App"</strong> (16 lettere) generabile su <code>myaccount.google.com/apppasswords</code>.</span>
            )}
            {selectedProvider === 'outlook' && (
              <span><strong>Outlook / Hotmail:</strong> Inserisci la tua email <code>@outlook</code> o <code>@hotmail</code> e la password.</span>
            )}
          </div>
        </div>

        {/* ── MODULO INSERIMENTO CREDENZIALI ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              2. Indirizzo Email Reale
            </label>
            <input
              type="email"
              placeholder={getPlaceholderEmail()}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: '#fff',
                fontSize: 'var(--font-sm)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              3. Password Casella di Posta
            </label>
            <input
              type="password"
              placeholder="Inserisci la password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                color: '#fff',
                fontSize: 'var(--font-sm)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
              Nome Casella (Opzionale)
            </label>
            <input
              type="text"
              placeholder="Es. Mia Mail Personale"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: '#fff',
                fontSize: 'var(--font-sm)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Info Cifratura Locale */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: 'var(--spacing-sm)',
          fontSize: 'var(--font-xs)',
          color: '#10b981'
        }}>
          <ShieldCheck size={14} />
          <span>Server SSL: {imapHost}:{imapPort} (dati salvati solo sul tuo dispositivo)</span>
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
              <span>Verifica connessione sul server {selectedProvider.toUpperCase()}...</span>
            </>
          ) : connectionSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Casella Connessa con Successo!</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Collega Casella Email Reale</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
