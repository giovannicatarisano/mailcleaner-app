import React from 'react';
import { X, Mail, Tag, Clock, HardDrive, ShieldCheck, RotateCcw } from 'lucide-react';
import { EmailMessage } from '../types/index.ts';

interface EmailDetailModalProps {
  email: EmailMessage | null;
  onClose: () => void;
  onRestore?: (emailId: string) => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  email,
  onClose,
  onRestore
}) => {
  if (!email) return null;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <span className="pill-badge pill-primary" style={{ marginBottom: '6px' }}>
              {email.status === 'trashed' ? 'Spostata nel Cestino' : 'Posta in arrivo'}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
              {email.subject}
            </h3>
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
            <X size={16} />
          </button>
        </div>

        {/* Metadata info card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '14px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Mittente:</span>
            <strong style={{ color: '#fff' }}>{email.senderName} ({email.sender})</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Casella di destinazione:</span>
            <span style={{ color: '#a5b4fc' }}>{email.accountEmail}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Data ricezione:</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatDate(email.date)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)' }}>Dimensione:</span>
            <span style={{ color: 'var(--text-muted)' }}>{email.sizeKb} KB</span>
          </div>
          {email.matchedRuleName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Regola applicata:</span>
              <strong style={{ color: '#6ee7b7' }}>{email.matchedRuleName}</strong>
            </div>
          )}
        </div>

        {/* Snippet body preview */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '14px',
          fontSize: '13px',
          color: '#e2e8f0',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          {email.snippet}
        </div>

        {/* Bottom actions */}
        {email.status === 'trashed' && onRestore && (
          <button
            className="pulse-clean-btn"
            onClick={() => {
              onRestore(email.id);
              onClose();
            }}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            <RotateCcw size={16} />
            <span>Ripristina nella Posta in Arrivo</span>
          </button>
        )}
      </div>
    </div>
  );
};
