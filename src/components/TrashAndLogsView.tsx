import React, { useState } from 'react';
import { Trash2, History, RotateCcw, ShieldCheck, Search, AlertTriangle } from 'lucide-react';
import { EmailMessage, CleanHistoryLog } from '../types/index.ts';

interface TrashAndLogsViewProps {
  emails: EmailMessage[];
  logs: CleanHistoryLog[];
  onRestoreEmail: (emailId: string) => void;
  onEmptyTrash: () => void;
  onSelectEmail: (email: EmailMessage) => void;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
};

export const TrashAndLogsView: React.FC<TrashAndLogsViewProps> = ({
  emails, logs, onRestoreEmail, onEmptyTrash, onSelectEmail,
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
  const totalTrashMb = Math.round(trashedEmails.reduce((a, e) => a + e.sizeKb / 1024, 0) * 100) / 100;

  const tabBtn = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--text-muted)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    fontSize: 'var(--font-xs)',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background 0.2s ease',
  });

  return (
    <div className="screen-content">

      {/* ── Intestazione + tab switcher ───────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, color: '#fff' }}>
            {activeTab === 'trash' ? 'Cestino Sicuro' : 'Registro Attività'}
          </h2>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activeTab === 'trash'
              ? 'Email spostate dalle regole, ripristinabili in ogni momento'
              : 'Storico dettagliato di tutte le pulizie eseguite'}
          </p>
        </div>

        {/* Tab pill switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: 'var(--radius-full)',
          padding: '3px',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <button onClick={() => setActiveTab('trash')} style={tabBtn(activeTab === 'trash')}>
            <Trash2 size={11} />
            <span>Cestino ({trashedEmails.length})</span>
          </button>
          <button onClick={() => setActiveTab('logs')} style={tabBtn(activeTab === 'logs')}>
            <History size={11} />
            <span>Log ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 1: CESTINO                                      */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'trash' && (
        <>
          {/* Summary bar */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff' }}>
                {trashedEmails.length} messaggi nel Cestino
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                {totalTrashMb} MB • Eliminazione automatica dopo 30 gg
              </div>
            </div>
            {trashedEmails.length > 0 && (
              <button
                onClick={() => setShowEmptyConfirm(true)}
                style={{
                  background: 'rgba(244,63,94,0.12)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  color: '#fda4af',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: '8px',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Svuota Ora
              </button>
            )}
          </div>

          {/* Barra ricerca */}
          {trashedEmails.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
            }}>
              <Search size={13} color="var(--text-dim)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Cerca per mittente o oggetto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 'var(--font-xs)',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
          )}

          {/* Empty state cestino */}
          {trashedEmails.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 'clamp(40px, 6dvh, 50px)',
                height: 'clamp(40px, 6dvh, 50px)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-sm) auto',
                color: '#34d399',
              }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
                Il Cestino è Vuoto
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Le email pulite dalle regole appariranno qui con possibilità di ripristino istantaneo.
              </p>
            </div>
          ) : (
            /* Lista email nel cestino */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {filteredTrash.map(email => (
                <div
                  key={email.id}
                  className="glass-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectEmail(email)}
                >
                  {/* Riga mittente + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email.senderName}
                      </div>
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {email.sender}
                      </div>
                    </div>
                    <span className="pill-badge pill-primary" style={{ flexShrink: 0 }}>
                      {email.matchedRuleName || 'Auto'}
                    </span>
                  </div>

                  {/* Oggetto */}
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                    {email.subject}
                  </div>

                  {/* Snippet */}
                  <div style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: 'var(--spacing-xs)',
                  }}>
                    {email.snippet}
                  </div>

                  {/* Footer: dimensione + ripristina */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: 'var(--spacing-xs)',
                  }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                      {email.sizeKb} KB
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); onRestoreEmail(email.id); }}
                      style={{
                        background: 'rgba(16,185,129,0.12)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#6ee7b7',
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <RotateCcw size={10} />
                      <span>Ripristina</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 2: LOG ATTIVITÀ                                 */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <>
          {logs.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{
                width: 'clamp(40px, 6dvh, 50px)',
                height: 'clamp(40px, 6dvh, 50px)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--spacing-sm) auto',
                color: '#818cf8',
              }}>
                <History size={22} />
              </div>
              <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
                Nessuna attività registrata
              </h3>
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                I dettagli di ogni pulizia manuale o automatica verranno registrati qui.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              {logs.map(log => (
                <div key={log.id} className="glass-card">
                  {/* Riga badge + data + MB */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexWrap: 'wrap' }}>
                      <span className={`pill-badge ${log.isDailyAutoRun ? 'pill-success' : 'pill-primary'}`}>
                        {log.isDailyAutoRun ? 'Auto Notturno' : 'Manuale'}
                      </span>
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: '#34d399', flexShrink: 0 }}>
                      +{log.storageFreedMb} MB
                    </span>
                  </div>

                  {/* Email spostate */}
                  <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
                    {log.emailsCleaned} messaggi spostati nel Cestino
                  </div>

                  {/* Breakdown per regola */}
                  {log.ruleBreakdown?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {log.ruleBreakdown.map((r, i) => (
                        <span key={i} style={{
                          fontSize: 'var(--font-xs)',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                        }}>
                          {r.ruleName}: <strong>{r.count}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal conferma svuotamento cestino ──────────── */}
      {showEmptyConfirm && (
        <div className="modal-overlay" onClick={() => setShowEmptyConfirm(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="sheet-handle" />
            <div style={{
              width: 'clamp(42px, 6dvh, 52px)',
              height: 'clamp(42px, 6dvh, 52px)',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-sm) auto',
              color: '#f43f5e',
            }}>
              <AlertTriangle size={22} />
            </div>
            <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: '#fff', marginBottom: 'var(--spacing-xs)' }}>
              Svuotare definitivamente il Cestino?
            </h3>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)', lineHeight: 1.4 }}>
              Stai per eliminare definitivamente {trashedEmails.length} email. Questa operazione non potrà essere annullata.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
              <button
                onClick={() => setShowEmptyConfirm(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm)',
                  color: '#fff',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Annulla
              </button>
              <button
                onClick={() => { onEmptyTrash(); setShowEmptyConfirm(false); }}
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm)',
                  color: '#fff',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
