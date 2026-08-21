import React, { useState } from 'react';
import {
  Plus,
  SlidersHorizontal,
  Trash2,
  ShieldCheck,
  Clock,
  Tag,
  Search,
  Play
} from 'lucide-react';
import { CleanRule, EmailMessage } from '../types/index.ts';
import { previewCleaning } from '../services/mailCleanerEngine.ts';

interface RulesViewProps {
  rules: CleanRule[];
  emails: EmailMessage[];
  onToggleRule: (ruleId: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onOpenNewRuleModal: () => void;
  onAddSuggestedRule: (template: Partial<CleanRule>) => void;
}

const suggestedTemplates = [
  {
    name: 'Newsletter & Promozioni > 15 gg',
    description: 'Sposta nel cestino le email promozionali più vecchie di 15 giorni',
    conditions: {
      olderThanDays: 15,
      senders: ['*@newsletter.*', '*@promo.*', 'offerte@*', 'news@*'],
      subjectKeywords: ['Sconto', 'Offerta', 'Saldi', 'Coupon'],
    },
    action: 'trash' as const,
    whitelist: { senders: ['*@paypal.com', '*@intesasanpaolo.com'], protectStarred: true, protectReceipts: true },
  },
  {
    name: 'Notifiche Social > 7 gg',
    description: 'Pulisce aggiornamenti di LinkedIn, Instagram e Twitter dopo 1 settimana',
    conditions: {
      olderThanDays: 7,
      senders: ['*@linkedin.com', '*@instagram.com', '*@twitter.com', '*@x.com'],
      subjectKeywords: ['notifica', 'visualizzato', 'follower'],
    },
    action: 'trash' as const,
    whitelist: { senders: [], protectStarred: true, protectReceipts: true },
  },
  {
    name: 'Email non lette > 60 gg',
    description: 'Pulisce le mail dimenticate e non lette da oltre 2 mesi',
    conditions: { olderThanDays: 60, unreadOnly: true },
    action: 'trash' as const,
    whitelist: { senders: [], protectStarred: true, protectReceipts: true },
  },
];

const btnSm: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '5px 10px',
  fontSize: 'var(--font-xs)',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

export const RulesView: React.FC<RulesViewProps> = ({
  rules, emails, onToggleRule, onDeleteRule, onOpenNewRuleModal, onAddSuggestedRule,
}) => {
  const [dryRunId, setDryRunId] = useState<string | null>(null);

  return (
    <div className="screen-content">

      {/* ── Intestazione ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#fff' }}>
            Filtri &amp; Regole ({rules.length})
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            Configura come MailCleaner gestisce le tue email
          </p>
        </div>
        <button
          onClick={onOpenNewRuleModal}
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
          <span>Nuova</span>
        </button>
      </div>

      {/* ── Empty state o lista regole ────────────────────── */}
      {rules.length === 0 ? (
        <>
          {/* Empty state */}
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{
              width: 'clamp(40px, 6dvh, 52px)',
              height: 'clamp(40px, 6dvh, 52px)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-sm) auto',
              color: '#818cf8',
            }}>
              <SlidersHorizontal size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
              Nessuna regola configurata
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 'var(--spacing-md)' }}>
              Crea la tua prima regola personalizzata oppure scegli un modello suggerito qui sotto.
            </p>
            <button
              onClick={onOpenNewRuleModal}
              className="pulse-clean-btn"
              style={{ maxWidth: '240px', margin: '0 auto' }}
            >
              <Plus size={15} />
              <span>Crea Regola Personalizzata</span>
            </button>
          </div>

          {/* Suggested templates */}
          <div>
            <h4 style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
              Modelli Consigliati
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {suggestedTemplates.map((tpl, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff' }}>{tpl.name}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', marginTop: '2px' }}>{tpl.description}</div>
                  </div>
                  <button
                    onClick={() => onAddSuggestedRule(tpl)}
                    style={{ ...btnSm, color: '#6ee7b7', flexShrink: 0 }}
                  >
                    + Aggiungi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {rules.map(rule => {
            const preview = previewCleaning(emails, [rule]);
            const isDryOpen = dryRunId === rule.id;

            return (
              <div
                key={rule.id}
                className="glass-card"
                style={{ borderLeft: rule.isEnabled ? '3px solid #6366f1' : '3px solid rgba(255,255,255,0.08)' }}
              >
                {/* Titolo + Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: rule.isEnabled ? '#fff' : 'var(--text-dim)' }}>
                        {rule.name}
                      </h3>
                      <span className={`pill-badge ${rule.isEnabled ? 'pill-success' : 'pill-primary'}`}>
                        {rule.isEnabled ? 'Attiva' : 'In Pausa'}
                      </span>
                    </div>
                    {rule.description && (
                      <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', marginTop: '2px' }}>{rule.description}</p>
                    )}
                  </div>
                  <div
                    className={`toggle-switch ${rule.isEnabled ? 'on' : ''}`}
                    onClick={() => onToggleRule(rule.id)}
                    title={rule.isEnabled ? 'Disattiva' : 'Attiva'}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>

                {/* Pills condizioni */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: 'var(--spacing-sm)' }}>
                  {rule.conditions.olderThanDays && (
                    <span className="pill-badge pill-primary"><Clock size={9} /><span>&gt; {rule.conditions.olderThanDays} gg</span></span>
                  )}
                  {rule.conditions.senders?.length ? (
                    <span className="pill-badge pill-primary"><Tag size={9} /><span>{rule.conditions.senders.length} mittenti</span></span>
                  ) : null}
                  {rule.conditions.subjectKeywords?.length ? (
                    <span className="pill-badge pill-primary"><Search size={9} /><span>{rule.conditions.subjectKeywords.slice(0, 2).join(', ')}</span></span>
                  ) : null}
                  {rule.conditions.unreadOnly && <span className="pill-badge pill-warning">Solo non lette</span>}
                  <span className="pill-badge pill-success"><ShieldCheck size={9} /><span>Whitelist attiva</span></span>
                </div>

                {/* Preview corrispondenze */}
                <div style={{
                  background: 'rgba(0,0,0,0.22)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    Corrispondenze: <strong style={{ color: '#6ee7b7' }}>{preview.totalEmailsToClean}</strong>
                    <span style={{ color: 'var(--text-dim)' }}> ({preview.totalStorageFreedMb} MB)</span>
                  </div>
                  <button
                    onClick={() => setDryRunId(isDryOpen ? null : rule.id)}
                    style={{ ...btnSm, color: '#818cf8', background: 'transparent', border: 'none' }}
                  >
                    <Play size={9} />
                    <span>{isDryOpen ? 'Chiudi' : 'Testa'}</span>
                  </button>
                </div>

                {/* Dry run espanso */}
                {isDryOpen && (
                  <div style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-sm)',
                  }}>
                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: '#a5b4fc', marginBottom: '5px' }}>
                      Anteprima messaggi intercettati:
                    </div>
                    {preview.matches.length === 0 ? (
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                        Nessun messaggio corrisponde a questi parametri.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '130px', overflowY: 'auto' }}>
                        {preview.matches.map(m => (
                          <div key={m.email.id} style={{ fontSize: 'var(--font-xs)', padding: '3px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px' }}>
                            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{m.email.subject}</div>
                            <div style={{ color: 'var(--text-dim)' }}>{m.email.senderName} • {m.email.sizeKb} KB</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer azioni */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: 'var(--spacing-xs)',
                }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                    Azione: <strong>Cestino Sicuro</strong>
                  </span>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    style={{ ...btnSm, color: 'var(--accent-rose)', background: 'transparent', border: 'none' }}
                  >
                    <Trash2 size={12} />
                    <span>Elimina</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
