import React, { useState } from 'react';
import { Trash2, History, RotateCcw, ShieldCheck, Search, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { EmailMessage, CleanHistoryLog } from '../types/index.ts';

interface TrashAndLogsViewProps {
  emails: EmailMessage[];
  logs: CleanHistoryLog[];
  onRestoreEmail: (emailId: string) => void;
  onEmptyTrash: () => void;
  onSelectEmail: (email: EmailMessage) => void;
}

export const TrashAndLogsView: React.FC<TrashAndLogsViewProps> = ({
  emails,
  logs,
  onRestoreEmail,
  onEmptyTrash,
  onSelectEmail
}) => {
  const [activeTab, setActiveTab] = useState<'trash' | 'logs'>('trash');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const trashedEmails = emails.filter(e => e.status === 'trashed');
  const filteredTrash = trashedEmails.filter(e =>
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTrashStorageMb = Math.round(trashedEmails.reduce((acc, curr) => acc + (curr.sizeKb / 1024), 0) * 100) / 100;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="screen-content">
      {/* Header bar with Sub-Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            {activeTab === 'trash' ? 'Cestino Sicuro' : 'Registro Attività'}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeTab === 'trash' ? 'Email spostate dalle regole, ripristinabili in ogni momento' : 'Storico dettagliato di tutte le pulizie eseguite'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('trash')}
            style={{
              background: activeTab === 'trash' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'trash' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Trash2 size={12} />
            <span>Cestino ({trashedEmails.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            style={{
              background: activeTab === 'logs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'logs' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <History size={12} />
            <span>Log ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CESTINO SICURO */}
      {activeTab === 'trash' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Summary & Empty trash bar */}
          <div className="glass-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                {trashedEmails.length} messaggi nel Cestino
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Occupa {totalTrashStorageMb} MB • Eliminazione definitiva automatica tra 30 gg
              </div>
            </div>

            {trashedEmails.length > 0 && (
              <button
                onClick={() => setShowEmptyConfirm(true)}
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fda4af',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Svuota Ora
              </button>
            )}
          </div>

          {/* Search bar */}
          {trashedEmails.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '8px 12px'
            }}>
              <Search size={14} color="var(--text-dim)" />
              <input
                type="text"
                placeholder="Cerca per mittente o oggetto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          )}

          {/* Empty State */}
          {trashedEmails.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                color: '#34d399'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                Il Cestino è Vuoto
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Nessuna email è stata spostata nel cestino di recente. Le email pulite dalle regole appariranno qui con possibilità di ripristino istantaneo.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTrash.map(email => (
                <div
                  key={email.id}
                  className="glass-card"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectEmail(email)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                        {email.senderName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {email.sender} • {email.accountEmail}
                      </div>
                    </div>

                    <span className="pill-badge pill-primary" style={{ fontSize: '9px' }}>
                      {email.matchedRuleName || 'Regola Automatica'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>
                    {email.subject}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {email.snippet}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: '8px',
                    marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      Dimensione: {email.sizeKb} KB
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRestoreEmail(email.id);
                      }}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#6ee7b7',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={11} />
                      <span>Ripristina nella Posta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTRO ATTIVITÀ (AUDIT LOGS) */}
      {activeTab === 'logs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                color: '#818cf8'
              }}>
                <History size={24} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                Nessuna attività registrata
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                I dettagli e le statistiche di ogni pulizia manuale o automatica verranno registrati qui.
              </p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="glass-card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`pill-badge ${log.isDailyAutoRun ? 'pill-success' : 'pill-primary'}`}>
                      {log.isDailyAutoRun ? 'Auto Cron Notturno' : 'Pulizia Manuale'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      {formatDate(log.timestamp)}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399' }}>
                    +{log.storageFreedMb} MB Liberati
                  </span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  {log.emailsCleaned} messaggi spostati nel Cestino
                </div>

                {log.ruleBreakdown && log.ruleBreakdown.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {log.ruleBreakdown.map((r, i) => (
                      <span key={i} style={{
                        fontSize: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        color: 'var(--text-muted)'
                      }}>
                        {r.ruleName}: <strong>{r.count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal to Empty Trash */}
      {showEmptyConfirm && (
        <div className="modal-overlay" onClick={() => setShowEmptyConfirm(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#f43f5e'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              Svuotare definitivamente il Cestino?
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: '1.4' }}>
              Stai per eliminare definitivamente {trashedEmails.length} email. Questa operazione non potrà essere annullata.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => setShowEmptyConfirm(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onEmptyTrash();
                  setShowEmptyConfirm(false);
                }}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
