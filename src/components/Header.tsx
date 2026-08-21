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
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      background: 'rgba(9, 13, 22, 0.95)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <div style={{
          width: 'clamp(30px, 4.5dvh, 38px)',
          height: 'clamp(30px, 4.5dvh, 38px)',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}>
          <Sparkles size={17} />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-md)', fontWeight: 800, letterSpacing: '-0.3px', color: '#fff', lineHeight: 1.1 }}>
            MailCleaner
          </h1>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-dim)' }}>
            Assistente Pulizia Email
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
        {settings.autoCleanEnabled && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '3px 8px',
            borderRadius: '999px',
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            color: '#34d399',
          }}>
            <Clock size={11} />
            <span>{settings.scheduledTime}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          style={{
            width: 'clamp(30px, 4.5dvh, 38px)',
            height: 'clamp(30px, 4.5dvh, 38px)',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          title="Impostazioni"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};
