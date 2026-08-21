import React, { useState } from 'react';
import { X, Sliders, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { CleanRule, EmailAccount } from '../types/index.ts';

interface NewRuleModalProps {
  accounts: EmailAccount[];
  onClose: () => void;
  onSaveRule: (rule: CleanRule) => void;
}

export const NewRuleModal: React.FC<NewRuleModalProps> = ({
  accounts,
  onClose,
  onSaveRule
}) => {
  const [name, setName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<'all' | string>('all');
  const [olderThanDays, setOlderThanDays] = useState<number>(14);
  const [sendersInput, setSendersInput] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [action, setAction] = useState<'trash' | 'permanent_delete'>('trash');
  const [protectStarred, setProtectStarred] = useState(true);
  const [protectReceipts, setProtectReceipts] = useState(true);
  const [whitelistSendersInput, setWhitelistSendersInput] = useState('*@paypal.com, *@banca*, *@intesasanpaolo.com');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Inserisci un nome per la regola (es. "Newsletter vecchie")');
      return;
    }

    const sendersList = sendersInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const keywordsList = keywordsInput
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const whitelistSenders = whitelistSendersInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newRule: CleanRule = {
      id: `rule-${Date.now()}`,
      name: name.trim(),
      isEnabled: true,
      targetAccountIds: selectedAccountId === 'all' ? 'all' : [selectedAccountId],
      conditions: {
        olderThanDays: Number(olderThanDays),
        senders: sendersList.length > 0 ? sendersList : undefined,
        subjectKeywords: keywordsList.length > 0 ? keywordsList : undefined,
        unreadOnly
      },
      action,
      whitelist: {
        senders: whitelistSenders,
        protectStarred,
        protectReceipts
      },
      createdAt: new Date().toISOString(),
      stats: {
        emailsMatched: 0,
        storageFreedMb: 0
      }
    };

    onSaveRule(newRule);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sliders size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                Crea Nuova Regola
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Definisci filtri e condizioni di pulizia automatica
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

        {formError && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#fda4af'
          }}>
            <AlertCircle size={14} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Nome Regola */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Nome della Regola *
            </label>
            <input
              type="text"
              placeholder="es. Elimina Newsletter Zalando & Promozioni"
              value={name}
              onChange={e => { setName(e.target.value); setFormError(null); }}
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

          {/* Account Target */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Applica a Casella Email
            </label>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              style={{
                width: '100%',
                background: '#131b2e',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              <option value="all">🌐 Tutte le caselle collegate ({accounts.length})</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.email})
                </option>
              ))}
            </select>
          </div>

          {/* Età Minima Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Età minima delle email (Anzianità)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[7, 14, 30, 60].map(days => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setOlderThanDays(days)}
                  style={{
                    background: olderThanDays === days ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (olderThanDays === days ? 'var(--primary)' : 'var(--border-subtle)'),
                    borderRadius: '10px',
                    padding: '8px 4px',
                    color: olderThanDays === days ? '#fff' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  &gt; {days} gg
                </button>
              ))}
            </div>
          </div>

          {/* Mittenti e Domini */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Filtro Mittenti o Domini (separati da virgola)
            </label>
            <input
              type="text"
              placeholder="es. *@newsletter.it, *@promo.*, offerte@zalando.it"
              value={sendersInput}
              onChange={e => setSendersInput(e.target.value)}
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
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px', display: 'block' }}>
              Usa <code>*@dominio.com</code> per intercettare qualsiasi indirizzo da quel fornitore.
            </span>
          </div>

          {/* Parole Chiave Oggetto */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
              Parole Chiave nell'Oggetto (opzionale)
            </label>
            <input
              type="text"
              placeholder="es. Sconto, Saldi, Offerta speciale, Black Friday"
              value={keywordsInput}
              onChange={e => setKeywordsInput(e.target.value)}
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

          {/* Protezioni Whitelist (Sicurezza) */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '14px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#6ee7b7' }}>
                Protezioni di Sicurezza (Whitelist)
              </span>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', cursor: 'pointer', marginBottom: '6px' }}>
              <input
                type="checkbox"
                checked={protectReceipts}
                onChange={e => setProtectReceipts(e.target.checked)}
                style={{ accentColor: '#10b981' }}
              />
              <span>Non cancellare mai ricevute, ordini, fatture e avvisi bancari</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={protectStarred}
                onChange={e => setProtectStarred(e.target.checked)}
                style={{ accentColor: '#10b981' }}
              />
              <span>Proteggi sempre i messaggi contrassegnati come speciali (⭐)</span>
            </label>
          </div>

          {/* Azione di pulizia (Predefinito: Cestino) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Azione di Pulizia
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAction('trash')}
                style={{
                  background: action === 'trash' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (action === 'trash' ? '#6366f1' : 'var(--border-subtle)'),
                  borderRadius: '12px',
                  padding: '10px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: action === 'trash' ? '#818cf8' : '#fff' }}>
                  🗑️ Sposta nel Cestino
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Consigliato per sicurezza (ripristinabile per 30gg)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAction('permanent_delete')}
                style={{
                  background: action === 'permanent_delete' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (action === 'permanent_delete' ? '#f43f5e' : 'var(--border-subtle)'),
                  borderRadius: '12px',
                  padding: '10px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: action === 'permanent_delete' ? '#fda4af' : '#fff' }}>
                  ⚡ Elimina Subito
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Eliminazione definitiva immediata dal server
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="pulse-clean-btn"
            style={{ marginTop: '10px' }}
          >
            <Sparkles size={16} />
            <span>Salva e Attiva Regola</span>
          </button>
        </form>
      </div>
    </div>
  );
};
