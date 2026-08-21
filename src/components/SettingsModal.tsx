import React from 'react';
import { X, Clock, ShieldCheck, Bell, Trash, RefreshCw, Smartphone } from 'lucide-react';
import { AppSettings } from '../types/index.ts';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose
}) => {
  const handleToggleAutoClean = () => {
    onUpdateSettings({
      ...settings,
      autoCleanEnabled: !settings.autoCleanEnabled
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      scheduledTime: e.target.value
    });
  };

  const handleActionChange = (action: 'trash' | 'permanent_delete') => {
    onUpdateSettings({
      ...settings,
      defaultAction: action
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '88vh', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
              Impostazioni MailCleaner
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Configura l'automazione giornaliera e le preferenze
            </p>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Sezione 1: Automazione Giornaliera */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  Pulizia Automatica Giornaliera
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Esegui automaticamente i filtri ogni notte
                </div>
              </div>

              <div
                className={`toggle-switch ${settings.autoCleanEnabled ? 'on' : ''}`}
                onClick={handleToggleAutoClean}
              >
                <div className="toggle-knob" />
              </div>
            </div>

            {settings.autoCleanEnabled && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0' }}>
                  <Clock size={14} color="#818cf8" />
                  <span>Orario di Esecuzione Notturno:</span>
                </div>
                <select
                  value={settings.scheduledTime}
                  onChange={handleTimeChange}
                  style={{
                    background: '#131b2e',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value="01:00">01:00 AM</option>
                  <option value="02:00">02:00 AM</option>
                  <option value="03:00">03:00 AM (Consigliato)</option>
                  <option value="04:00">04:00 AM</option>
                  <option value="06:00">06:00 AM</option>
                  <option value="23:00">23:00 PM</option>
                </select>
              </div>
            )}
          </div>

          {/* Sezione 2: Modalità di Sicurezza Predefinita */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Modalità di Eliminazione Predefinita</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleActionChange('trash')}
                style={{
                  background: settings.defaultAction === 'trash' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (settings.defaultAction === 'trash' ? '#6366f1' : 'var(--border-subtle)'),
                  borderRadius: '10px',
                  padding: '8px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: settings.defaultAction === 'trash' ? '#818cf8' : '#fff' }}>
                  🗑️ Cestino Sicuro
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Ripristinabile per 30 giorni
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleActionChange('permanent_delete')}
                style={{
                  background: settings.defaultAction === 'permanent_delete' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid ' + (settings.defaultAction === 'permanent_delete' ? '#f43f5e' : 'var(--border-subtle)'),
                  borderRadius: '10px',
                  padding: '8px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: settings.defaultAction === 'permanent_delete' ? '#fda4af' : '#fff' }}>
                  ⚡ Definitiva
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  Elimina subito dal server
                </div>
              </button>
            </div>
          </div>

          {/* Sezione 3: Reset Dati Demo */}
          <div className="glass-card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                  Dati di Test & Demo
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Ripristina le email demo e le caselle iniziali
                </div>
              </div>

              <button
                onClick={onResetData}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={12} />
                <span>Ripristina</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
