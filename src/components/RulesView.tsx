import React, { useState } from 'react';
import {
  Plus,
  SlidersHorizontal,
  Trash2,
  ShieldCheck,
  Clock,
  Tag,
  Search,
  CheckCircle,
  HelpCircle,
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

export const RulesView: React.FC<RulesViewProps> = ({
  rules,
  emails,
  onToggleRule,
  onDeleteRule,
  onOpenNewRuleModal,
  onAddSuggestedRule
}) => {
  const [selectedRuleForDryRun, setSelectedRuleForDryRun] = useState<string | null>(null);

  const suggestedTemplates = [
    {
      name: 'Newsletter & Promozioni > 15 gg',
      description: 'Sposta nel cestino le email promozionali più vecchie di 15 giorni',
      conditions: {
        olderThanDays: 15,
        senders: ['*@newsletter.*', '*@promo.*', 'offerte@*', 'news@*'],
        subjectKeywords: ['Sconto', 'Offerta', 'Saldi', 'Coupon']
      },
      action: 'trash' as const,
      whitelist: {
        senders: ['*@paypal.com', '*@intesasanpaolo.com', '*@banca*'],
        protectStarred: true,
        protectReceipts: true
      }
    },
    {
      name: 'Notifiche Social > 7 gg',
      description: 'Pulisce aggiornamenti di LinkedIn, Instagram e Twitter dopo 1 settimana',
      conditions: {
        olderThanDays: 7,
        senders: ['*@linkedin.com', '*@instagram.com', '*@twitter.com', '*@x.com'],
        subjectKeywords: ['notifica', 'visualizzato', 'follower']
      },
      action: 'trash' as const,
      whitelist: {
        senders: [],
        protectStarred: true,
        protectReceipts: true
      }
    },
    {
      name: 'Email non lette > 60 gg',
      description: 'Pulisce le mail dimenticate e non lette da oltre 2 mesi',
      conditions: {
        olderThanDays: 60,
        unreadOnly: true
      },
      action: 'trash' as const,
      whitelist: {
        senders: [],
        protectStarred: true,
        protectReceipts: true
      }
    }
  ];

  return (
    <div className="screen-content">
      {/* Header bar of Rules view */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            Filtri & Regole ({rules.length})
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Configura come MailCleaner gestisce e pulisce le tue email
          </p>
        </div>

        <button
          onClick={onOpenNewRuleModal}
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
          <span>Nuova Regola</span>
        </button>
      </div>

      {/* Rules List or Empty State */}
      {rules.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#818cf8'
            }}>
              <SlidersHorizontal size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Nessuna regola configurata
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto 16px auto', lineHeight: '1.4' }}>
              Hai scelto di partire da zero! Crea la tua prima regola personalizzata oppure seleziona uno dei modelli suggeriti qui sotto.
            </p>
            <button
              onClick={onOpenNewRuleModal}
              className="pulse-clean-btn"
              style={{ maxWidth: '240px', margin: '0 auto', fontSize: '13px', padding: '10px 16px' }}
            >
              <Plus size={16} />
              <span>Crea Regola Personalizzata</span>
            </button>
          </div>

          {/* Preset templates options */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Modelli Consigliati da Provare
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suggestedTemplates.map((tpl, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                      {tpl.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {tpl.description}
                    </div>
                  </div>
                  <button
                    onClick={() => onAddSuggestedRule(tpl)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--border-subtle)',
                      color: '#6ee7b7',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Aggiungi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rules.map(rule => {
            const rulePreview = previewCleaning(emails, [rule]);
            const isDryRunOpen = selectedRuleForDryRun === rule.id;

            return (
              <div
                key={rule.id}
                className="glass-card"
                style={{
                  padding: '16px',
                  borderLeft: rule.isEnabled ? '3px solid #6366f1' : '3px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Rule Title & Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1, marginRight: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: rule.isEnabled ? '#fff' : 'var(--text-dim)' }}>
                        {rule.name}
                      </h3>
                      <span className={`pill-badge ${rule.isEnabled ? 'pill-success' : 'pill-primary'}`} style={{ fontSize: '9px' }}>
                        {rule.isEnabled ? 'Attiva' : 'In Pausa'}
                      </span>
                    </div>
                    {rule.description && (
                      <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {rule.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`toggle-switch ${rule.isEnabled ? 'on' : ''}`}
                    onClick={() => onToggleRule(rule.id)}
                    title={rule.isEnabled ? 'Disattiva regola' : 'Attiva regola'}
                  >
                    <div className="toggle-knob" />
                  </div>
                </div>

                {/* Filter tags breakdown */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {rule.conditions.olderThanDays && (
                    <span className="pill-badge pill-primary" style={{ fontSize: '10px' }}>
                      <Clock size={10} />
                      <span>&gt; {rule.conditions.olderThanDays} giorni</span>
                    </span>
                  )}
                  {rule.conditions.senders && rule.conditions.senders.length > 0 && (
                    <span className="pill-badge pill-primary" style={{ fontSize: '10px' }}>
                      <Tag size={10} />
                      <span>{rule.conditions.senders.length} mittenti / domini</span>
                    </span>
                  )}
                  {rule.conditions.subjectKeywords && rule.conditions.subjectKeywords.length > 0 && (
                    <span className="pill-badge pill-primary" style={{ fontSize: '10px' }}>
                      <Search size={10} />
                      <span>Parole chiave: {rule.conditions.subjectKeywords.slice(0, 2).join(', ')}</span>
                    </span>
                  )}
                  {rule.conditions.unreadOnly && (
                    <span className="pill-badge pill-warning" style={{ fontSize: '10px' }}>
                      Solo non lette
                    </span>
                  )}
                  <span className="pill-badge pill-success" style={{ fontSize: '10px' }}>
                    <ShieldCheck size={10} />
                    <span>Whitelist Ricevute e Speciali</span>
                  </span>
                </div>

                {/* Dry Run / Matches summary */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Email corrispondenti rilevate: <strong style={{ color: '#6ee7b7' }}>{rulePreview.totalEmailsToClean}</strong> ({rulePreview.totalStorageFreedMb} MB)
                  </div>
                  <button
                    onClick={() => setSelectedRuleForDryRun(isDryRunOpen ? null : rule.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Play size={10} />
                    <span>{isDryRunOpen ? 'Chiudi Test' : 'Testa Filtro'}</span>
                  </button>
                </div>

                {/* Dry run details expanded */}
                {isDryRunOpen && (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '10px',
                    padding: '10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px' }}>
                      Anteprima messaggi intercettati da questa regola:
                    </div>
                    {rulePreview.matches.length === 0 ? (
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Nessun messaggio nella posta in arrivo corrisponde a questi parametri al momento.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {rulePreview.matches.map(m => (
                          <div key={m.email.id} style={{ fontSize: '10px', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '6px' }}>
                            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{m.email.subject}</div>
                            <div style={{ color: 'var(--text-dim)' }}>{m.email.senderName} ({m.email.sender}) • {m.email.sizeKb} KB</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Azione: <strong>Sposta nel Cestino</strong>
                  </span>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-rose)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Elimina Regola</span>
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
