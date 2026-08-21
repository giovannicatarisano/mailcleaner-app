import React from 'react';
import { Sparkles, Settings, Clock } from 'lucide-react';
import { AppSettings } from '../types/index.ts';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, onOpenSettings }) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px 10px 18px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(9, 13, 22, 0.95)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', color: '#fff' }}>
            MailCleaner
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-1px' }}>
            Assistente Pulizia Email
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {settings.autoCleanEnabled && (
          <div
            title={`Pulizia automatica attiva ogni giorno alle ${settings.scheduledTime}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 8px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#34d399'
            }}
          >
            <Clock size={12} />
            <span>{settings.scheduledTime}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Impostazioni"
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
