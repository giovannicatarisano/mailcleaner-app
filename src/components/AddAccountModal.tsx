import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Lock, ShieldCheck, ArrowRight, Loader2, Sparkles, HelpCircle, Key, Server, AlertCircle } from 'lucide-react';
import { EmailAccount, EmailProvider } from '../types/index.ts';
import { testRealImapConnection } from '../services/imapService.ts';

interface AddAccountModalProps {
  onClose: () => void;
  onAddAccount: (account: EmailAccount) => void;
}

interface ProviderPreset {
  id: EmailProvider | 'virgilio' | 'yahoo';
  name: string;
  color: string;
  icon: string;
  host: string;
  port: number;
  domain: string;
  helpText: string;
}

const PROVIDERS: ProviderPreset[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    color: '#ea4335',
    icon: 'G',
    host: 'imap.gmail.com',
    port: 993,
    domain: '@gmail.com',
    helpText: 'Per Gmail usa la tua email e genera una "Password per le app" da Google Account → Sicurezza → Password per le app.',
  },
  {
    id: 'libero',
    name: 'Libero',
    color: '#f59e0b',
    icon: 'L',
    host: 'imapmail.libero.it',
    port: 993,
    domain: '@libero.it',
    helpText: 'Usa la tua email @libero.it e la tua password di accesso abituale (o password per le app se hai il 2FA).',
  },
  {
    id: 'virgilio',
    name: 'Virgilio',
    color: '#f97316',
    icon: 'V',
    host: 'in.virgilio.it',
    port: 993,
    domain: '@virgilio.it',
    helpText: 'Usa la tua email @virgilio.it e la tua password.',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    color: '#0078d4',
    icon: 'O',
    host: 'outlook.office365.com',
    port: 993,
    domain: '@outlook.it',
    helpText: 'Compatibile con account Outlook, Hotmail e Live.',
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    color: '#6001d2',
    icon: 'Y',
    host: 'imap.mail.yahoo.com',
    port: 993,
    domain: '@yahoo.it',
    helpText: 'Genera una "Password per le app" dalla sezione Sicurezza del tuo account Yahoo.',
  },
  {
    id: 'imap',
    name: 'Altro IMAP',
    color: '#8b5cf6',
    icon: '⚡',
    host: 'mail.tuodominio.it',
    port: 993,
    domain: '',
    helpText: 'Inserisci i parametri IMAP forniti dal tuo provider o server aziendale.',
  },
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  onClose,
  onAddAccount,
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>('libero');
  const [email, setEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('imapmail.libero.it');
  const [imapPort, setImapPort] = useState(993);
  const [useSsl, setUseSsl] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedPreset = PROVIDERS.find(p => p.id === selectedProviderId) || PROVIDERS[1];

  const handleProviderSelect = (preset: ProviderPreset) => {
    setSelectedProviderId(preset.id);
    setImapHost(preset.host);
    setImapPort(preset.port);
    setErrorMsg(null);
    if (!email || email.includes('@')) {
      setEmail(email.split('@')[0] ? `${email.split('@')[0]}${preset.domain}` : '');
    }
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
      // Esegue la verifica reale delle credenziali sul server IMAP
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
        const prov: EmailProvider = (selectedProviderId === 'virgilio' || selectedProviderId === 'yahoo')
          ? 'imap'
          : (selectedProviderId as EmailProvider);

        const newAccount: EmailAccount = {
          id: `acc-${Date.now()}`,
          email: email.trim(),
          provider: prov,
          name: accountName.trim() || `${selectedPreset.name} (${email.split('@')[0]})`,
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
      setErrorMsg(err.message || 'Errore di connessione al server IMAP. Verifica email e password.');
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
                Collega Casella Email Reale
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                Accesso crittografato SSL/TLS (IMAP)
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

        {/* Provider Selector Grid */}
        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
          <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
            Seleziona il tuo gestore email:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {PROVIDERS.map(p => {
              const isSelected = selectedProviderId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleProviderSelect(p)}
                  style={{
                    background: isSelected ? `${p.color}22` : 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid ' + (isSelected ? p.color : 'var(--border-subtle)'),
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: `${p.color}33`,
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px'
                  }}>
                    {p.icon}
                  </div>
                  <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Help Tip Box */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          marginBottom: 'var(--spacing-sm)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <HelpCircle size={14} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: 'var(--font-xs)', color: '#c7d2fe', lineHeight: 1.35 }}>
            <strong>{selectedPreset.name}:</strong> {selectedPreset.helpText}
          </div>
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

        {/* Input Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-sm)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Indirizzo Email
            </label>
            <input
              type="email"
              placeholder={`nome${selectedPreset.domain || '@email.it'}`}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-main)' }}>
                Password o App Password
              </label>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}
              >
                {showHelp ? 'Nascondi guida' : 'Cos\'è una App Password?'}
              </button>
            </div>
            <input
              type="password"
              placeholder="Inserisci password dell'account..."
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

          {/* Expandable App Password Guide */}
          {showHelp && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              border: '1px solid var(--border-subtle)'
            }}>
              <strong style={{ color: '#fff' }}>🔐 Password per le App:</strong> Se sul tuo account email hai attiva l'autenticazione a due fattori (SMS o codice app), i provider (come Google, Yahoo e Libero) richiedono di generare un codice a 16 caratteri dedicato (senza spazi) dalle impostazioni di sicurezza dell'account invece della tua password principale.
            </div>
          )}

          {/* Toggle Parametri Avanzati IMAP */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: 'var(--font-xs)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 0'
              }}
            >
              <Server size={11} />
              <span>{showAdvanced ? 'Nascondi parametri server IMAP' : 'Modifica server IMAP & porta SSL'}</span>
            </button>

            {showAdvanced && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '6px',
                marginTop: '6px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '8px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
                    Server Host IMAP
                  </label>
                  <input
                    type="text"
                    value={imapHost}
                    onChange={e => setImapHost(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      color: '#fff',
                      fontSize: 'var(--font-xs)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '2px' }}>
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
                      borderRadius: '6px',
                      padding: '6px 8px',
                      color: '#fff',
                      fontSize: 'var(--font-xs)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}
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
          <span>Credenziali salvate solo nel tuo dispositivo (cifrate in locale)</span>
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
              <span>Verifica connessione IMAP SSL in corso...</span>
            </>
          ) : connectionSuccess ? (
            <>
              <CheckCircle2 size={16} />
              <span>Casella Connessa con Successo!</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Connetti Casella {selectedPreset.name}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
