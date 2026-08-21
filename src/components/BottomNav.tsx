import React from 'react';
import { LayoutDashboard, SlidersHorizontal, Mail, Trash2 } from 'lucide-react';

export type NavTab = 'dashboard' | 'rules' | 'accounts' | 'trash';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeRulesCount: number;
  accountsCount: number;
  trashedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeRulesCount,
  accountsCount,
  trashedCount
}) => {
  return (
    <nav className="bottom-nav-bar">
      {/* Dashboard */}
      <button
        className={`nav-tab-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <div className="nav-icon-wrapper">
          <LayoutDashboard size={20} />
        </div>
        <span>Dashboard</span>
      </button>

      {/* Regole & Filtri */}
      <button
        className={`nav-tab-item ${currentTab === 'rules' ? 'active' : ''}`}
        onClick={() => onSelectTab('rules')}
      >
        <div className="nav-icon-wrapper">
          <SlidersHorizontal size={20} />
        </div>
        <span>Filtri & Regole</span>
        {activeRulesCount > 0 && (
          <span className="nav-badge" style={{ background: '#6366f1' }}>
            {activeRulesCount}
          </span>
        )}
      </button>

      {/* Account */}
      <button
        className={`nav-tab-item ${currentTab === 'accounts' ? 'active' : ''}`}
        onClick={() => onSelectTab('accounts')}
      >
        <div className="nav-icon-wrapper">
          <Mail size={20} />
        </div>
        <span>Account</span>
        {accountsCount > 0 && (
          <span className="nav-badge" style={{ background: '#10b981' }}>
            {accountsCount}
          </span>
        )}
      </button>

      {/* Cestino & Storico */}
      <button
        className={`nav-tab-item ${currentTab === 'trash' ? 'active' : ''}`}
        onClick={() => onSelectTab('trash')}
      >
        <div className="nav-icon-wrapper">
          <Trash2 size={20} />
        </div>
        <span>Cestino</span>
        {trashedCount > 0 && (
          <span className="nav-badge">
            {trashedCount}
          </span>
        )}
      </button>
    </nav>
  );
};
