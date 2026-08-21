import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, HardDrive, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CleanHistoryLog, EmailAccount } from '../types/index.ts';

interface CleaningProgressModalProps {
  accounts: EmailAccount[];
  isDailyAutoRun: boolean;
  onComplete: () => void;
  cleaningSummary: {
    cleanedCount: number;
    freedMb: number;
    ruleBreakdown: { ruleName: string; count: number }[];
  };
}

export const CleaningProgressModal: React.FC<CleaningProgressModalProps> = ({
  accounts,
  isDailyAutoRun,
  onComplete,
  cleaningSummary
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [currentScanningAccount, setCurrentScanningAccount] = useState<string>('Gmail');

  const steps = [
    'Connessione sicura alle caselle email (Gmail, Libero, Outlook)...',
    'Scansione cartelle Inbox, Promozioni e Spam...',
    'Valutazione filtri e verifica Whitelist di sicurezza...',
    'Spostamento cautelativo dei messaggi nel Cestino...',
    'Pulizia completata con successo!'
  ];

  useEffect(() => {
    const t1 = setTimeout(() => {
      setCurrentStep(2);
      setProgressPercent(35);
      setCurrentScanningAccount('Libero Mail');
    }, 600);

    const t2 = setTimeout(() => {
      setCurrentStep(3);
      setProgressPercent(65);
      setCurrentScanningAccount('Outlook');
    }, 1200);

    const t3 = setTimeout(() => {
      setCurrentStep(4);
      setProgressPercent(90);
    }, 1800);

    const t4 = setTimeout(() => {
      setCurrentStep(5);
      setProgressPercent(100);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error', err);
      }
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="modal-overlay">
      <div className="bottom-sheet" style={{ textAlign: 'center', padding: '24px 20px 30px 20px' }}>
        {currentStep < 5 ? (
          <div>
            {/* Radar Pulse Animation */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 70%)',
              border: '2px solid rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              animation: 'pulseGlow 1.5s infinite ease-in-out',
              position: 'relative'
            }}>
              <Sparkles size={32} color="#818cf8" />
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              {isDailyAutoRun ? 'Pulizia Automatica Notturna in corso' : 'Pulizia Intelligente in corso'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '18px' }}>
              Scansione attiva su {currentScanningAccount}
            </p>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--primary-gradient)',
                transition: 'width 0.4s ease-out'
              }} />
            </div>

            {/* Current step text */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '10px',
              fontSize: '12px',
              color: '#a5b4fc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Loader2 size={14} className="animate-spin" />
              <span>{steps[currentStep - 1]}</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Complete celebration */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              color: '#34d399'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              Caselle Pulite con Successo!
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              I messaggi selezionati dai tuoi filtri sono stati archiviati nel Cestino Sicuro.
            </p>

            {/* Summary Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#6ee7b7' }}>
                  {cleaningSummary.cleanedCount}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Email nel Cestino
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>
                  {cleaningSummary.freedMb} MB
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Spazio Liberato
                </div>
              </div>
            </div>

            {/* Rules applied breakdown */}
            {cleaningSummary.ruleBreakdown.length > 0 && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: '12px',
                padding: '10px',
                marginBottom: '18px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Regole applicate:
                </div>
                {cleaningSummary.ruleBreakdown.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#e2e8f0', marginBottom: '3px' }}>
                    <span>{r.ruleName}</span>
                    <strong style={{ color: '#818cf8' }}>{r.count} email</strong>
                  </div>
                ))}
              </div>
            )}

            <button
              className="pulse-clean-btn"
              onClick={onComplete}
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <span>Chiudi e Torna alla Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
