// Tabbed app shell — the 4 wireframe directions become 4 views the user
// can switch between inside the app.

const { useState: tsUseState } = React;

const TABS = [
  { id: 'notebook', label: 'Notebook', short: 'today', icon: '☰' },
  { id: 'grid',     label: 'Grid',     short: 'grid',  icon: '▦' },
  { id: 'streaks',  label: 'Streaks',  short: 'streak',icon: '✦' },
  { id: 'race',     label: 'vs Jordan',short: 'vs',    icon: '◆' },
];

const renderView = (id, mobile) => {
  if (id === 'notebook') return <NotebookSpread mobile={mobile} />;
  if (id === 'grid')     return <GridMap        mobile={mobile} />;
  if (id === 'streaks')  return <StreakStack    mobile={mobile} />;
  if (id === 'race')     return <RaceTrack      mobile={mobile} />;
};

// Desktop: tab bar at top
const TabbedApp = ({ mobile = false }) => {
  const [active, setActive] = tsUseState('notebook');

  if (mobile) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: paper, position: 'relative',
        fontFamily: handFont,
      }}>
        {/* status-y bar */}
        <div style={{
          padding: '6px 14px',
          fontFamily: monoFont, fontSize: 10, color: inkSoft,
          display: 'flex', justifyContent: 'space-between',
          borderBottom: `1px dashed ${inkFaint}`,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ whiteSpace: 'nowrap' }}>9:41</span>
          <span style={{ whiteSpace: 'nowrap' }}>day 9 · w/ J</span>
        </div>
        {/* view */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderView(active, true)}
        </div>
        {/* bottom tabs */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: `1.4px solid ${ink}`,
          background: paper,
        }}>
          {TABS.map(t => {
            const isOn = active === t.id;
            return (
              <button key={t.id} onClick={() => setActive(t.id)} style={{
                background: isOn ? ink : 'transparent',
                color: isOn ? paper : ink,
                border: 'none', cursor: 'pointer',
                padding: '10px 4px 12px',
                fontFamily: handFont, fontSize: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                transition: 'background .15s',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
                <span>{t.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: paper, fontFamily: handFont,
    }}>
      {/* top app bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '12px 24px',
        borderBottom: `1.4px solid ${ink}`,
      }}>
        <div style={{ fontFamily: titleFont, fontSize: 26, lineHeight: 1 }}>30·days</div>
        <div style={{
          display: 'flex', gap: 0, marginLeft: 12,
          borderBottom: 'none',
        }}>
          {TABS.map(t => {
            const isOn = active === t.id;
            return (
              <button key={t.id} onClick={() => setActive(t.id)} style={{
                background: 'transparent',
                color: isOn ? ink : inkSoft,
                border: 'none', cursor: 'pointer',
                padding: '8px 16px 10px',
                fontFamily: handFont, fontSize: 16,
                position: 'relative',
                whiteSpace: 'nowrap',
                borderBottom: isOn ? `2.5px solid ${ink}` : `2.5px solid transparent`,
                marginBottom: -14,
                transform: isOn ? `rotate(${(t.id.length % 3) - 1}deg)` : 'none',
                fontWeight: isOn ? 700 : 400,
              }}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft }}>day 9 / 30</div>
          <Avatar letter="A" size={28} />
          <Avatar letter="J" color={accent} size={28} />
        </div>
      </div>
      {/* view */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {renderView(active, false)}
      </div>
    </div>
  );
};

window.TabbedApp = TabbedApp;
