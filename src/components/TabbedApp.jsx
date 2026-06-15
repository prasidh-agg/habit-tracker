import { useState, useEffect } from 'react';
import { getDayNum, todayStr, timeAgo } from '../lib/utils.js';
import { bg, paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../constants.js';
import { Avatar } from './primitives.jsx';
import NotebookSpread from './views/NotebookSpread.jsx';
import GridMap from './views/GridMap.jsx';
import StreakStack from './views/StreakStack.jsx';
import RaceTrack from './views/RaceTrack.jsx';

const TABS = [
  { id: 'notebook', label: 'Notebook', icon: '☰' },
  { id: 'grid',     label: 'Grid',     icon: '▦' },
  { id: 'streaks',  label: 'Streaks',  icon: '✦' },
  { id: 'race',     label: `vs`,       icon: '◆' },
];

export default function TabbedApp({ appData, userId, onMutate, onLogout, onRestart, onRefresh, lastSync, isMobile }) {
  const [activeTab, setActiveTab] = useState('notebook');
  const [syncLabel, setSyncLabel] = useState('just now');
  const [menuOpen, setMenuOpen] = useState(false);

  const { config, checkins = {} } = appData || {};
  const dayNum = config ? getDayNum(config.startDate) : 0;
  const totalDays = config ? (config.rampDays || 15) + (config.practiceDays || 15) : 30;
  const friendId = userId === 'prasidh' ? 'anisha' : 'prasidh';
  const userColor = ink;
  const friendColor = accent;

  // Update sync label every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncLabel(timeAgo(lastSync));
    }, 15000);
    setSyncLabel(timeAgo(lastSync));
    return () => clearInterval(interval);
  }, [lastSync]);

  if (!config) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: handFont, color: inkSoft }}>Loading...</div>
      </div>
    );
  }

  // Day clamping checks
  if (dayNum < 1) {
    const daysUntil = Math.abs(dayNum) + 1;
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, padding: 32,
      }}>
        <div style={{ fontFamily: titleFont, fontSize: 48, color: ink }}>30·days</div>
        <div style={{ fontFamily: handFont, fontSize: 20, color: inkSoft }}>
          Challenge starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}!
        </div>
        <div style={{ fontFamily: handFont, fontSize: 15, color: inkFaint }}>
          Start date: {config.startDate}
        </div>
      </div>
    );
  }

  if (dayNum > totalDays) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontFamily: titleFont, fontSize: 52, color: accent }}>Challenge Complete!</div>
        <div style={{ fontFamily: handFont, fontSize: 20, color: ink }}>
          You did it — 30 days of building habits together.
        </div>
        <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, marginTop: 8 }}>
          Well done, {config.users[userId]?.name}!
        </div>
      </div>
    );
  }

  const viewProps = { appData, userId, friendId, dayNum, totalDays, userColor, friendColor, onMutate, isMobile };

  const renderTab = () => {
    switch (activeTab) {
      case 'notebook': return <NotebookSpread {...viewProps} />;
      case 'grid':     return <GridMap {...viewProps} />;
      case 'streaks':  return <StreakStack {...viewProps} />;
      case 'race':     return <RaceTrack {...viewProps} />;
      default:         return <NotebookSpread {...viewProps} />;
    }
  };

  const friendName = config.users[friendId]?.name || 'Friend';

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Mobile status bar */}
        <div style={{
          padding: '10px 16px 8px',
          background: paperShade,
          borderBottom: `1px solid ${inkFaint}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: titleFont, fontSize: 22, color: ink }}>30·days</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>
              Day {dayNum}/{totalDays}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Avatar letter={config.users[userId]?.initial || '?'} color={userColor} size={26} />
              <Avatar letter={config.users[friendId]?.initial || '?'} color={friendColor} size={26} />
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 20, lineHeight: 1, color: inkSoft, padding: '2px 4px',
                }}
                aria-label="Menu"
              >
                ⋯
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 20,
                  background: paper, border: `1px solid ${inkFaint}`, borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(31,26,20,0.12)',
                  display: 'flex', flexDirection: 'column', minWidth: 140, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => { setMenuOpen(false); onRefresh(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 14px', fontFamily: handFont, fontSize: 15, color: ink }}
                  >
                    ↻ Refresh
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onRestart(); }}
                    style={{ background: 'none', border: 'none', borderTop: `1px solid ${inkFaint}`, cursor: 'pointer', textAlign: 'left', padding: '10px 14px', fontFamily: handFont, fontSize: 15, color: ink }}
                  >
                    ⟲ Restart challenge
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onLogout(); }}
                    style={{ background: 'none', border: 'none', borderTop: `1px solid ${inkFaint}`, cursor: 'pointer', textAlign: 'left', padding: '10px 14px', fontFamily: handFont, fontSize: 15, color: inkSoft }}
                  >
                    ⏻ Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderTab()}
        </div>

        {/* Mobile bottom tab bar */}
        <div style={{
          display: 'flex',
          background: paperShade,
          borderTop: `1px solid ${inkFaint}`,
          flexShrink: 0,
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const label = tab.id === 'race' ? `vs ${friendName.slice(0, 4)}` : tab.label;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '10px 4px 12px',
                  background: 'none',
                  border: 'none',
                  borderTop: `2px solid ${isActive ? accent : 'transparent'}`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 2,
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{tab.icon}</span>
                <span style={{
                  fontFamily: handFont, fontSize: 10,
                  color: isActive ? accent : inkSoft,
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top tab bar */}
      <div style={{
        padding: '0 32px',
        background: paperShade,
        borderBottom: `1px solid ${inkFaint}`,
        display: 'flex', alignItems: 'center',
        height: 54,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: titleFont, fontSize: 26, color: ink,
          marginRight: 36, letterSpacing: '-0.01em',
        }}>
          30·days
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const label = tab.id === 'race' ? `vs ${friendName}` : tab.label;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0 16px',
                  height: 54,
                  background: 'none',
                  border: 'none',
                  borderBottom: `2.5px solid ${isActive ? accent : 'transparent'}`,
                  cursor: 'pointer',
                  fontFamily: handFont,
                  fontSize: 16,
                  color: isActive ? accent : inkSoft,
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'color 0.15s',
                }}
              >
                <span>{tab.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: sync + avatars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onRefresh}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: handFont, fontSize: 12, color: inkSoft,
              padding: '4px 8px',
            }}
            title="Refresh"
          >
            <span style={{ fontSize: 14 }}>↻</span>
            <span>{syncLabel}</span>
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontFamily: handFont, fontSize: 13, color: ink }}>
                {config.users[userId]?.name}
              </span>
              <span style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>
                Day {dayNum}/{totalDays}
              </span>
            </div>
            <Avatar letter={config.users[userId]?.initial || '?'} color={userColor} size={34} />
            <Avatar letter={config.users[friendId]?.initial || '?'} color={friendColor} size={34} />
            <button
              onClick={onRestart}
              style={{
                background: 'none', border: `1px solid ${inkFaint}`,
                borderRadius: 4, cursor: 'pointer',
                fontFamily: handFont, fontSize: 12, color: inkSoft,
                padding: '3px 8px', marginLeft: 4,
              }}
              title="Wipe check-ins and restart the challenge"
            >
              restart
            </button>
            <button
              onClick={onLogout}
              style={{
                background: 'none', border: `1px solid ${inkFaint}`,
                borderRadius: 4, cursor: 'pointer',
                fontFamily: handFont, fontSize: 12, color: inkSoft,
                padding: '3px 8px',
              }}
            >
              logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderTab()}
      </div>
    </div>
  );
}
