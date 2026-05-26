import { getDayNum, todayStr, formatDate, addDays } from '../../lib/utils.js';
import { paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../../constants.js';
import { Paper } from '../primitives.jsx';

function GridCell({ type, isMobile }) {
  // type: 'before-reveal' | 'future' | 'done-user' | 'done-friend' | 'miss-user' | 'miss-friend' | 'empty'
  const size = isMobile ? 16 : 20;

  if (type === 'before-reveal') {
    return (
      <div style={{
        width: size, height: size,
        background: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 3px,
          rgba(31,26,20,0.08) 3px,
          rgba(31,26,20,0.08) 4px
        )`,
        borderRadius: 2,
        border: `1px solid ${inkFaint}`,
      }} />
    );
  }
  if (type === 'future') {
    return <div style={{ width: size, height: size }} />;
  }
  if (type === 'done-user') {
    return (
      <div style={{
        width: size, height: size,
        background: ink,
        borderRadius: 2,
      }} />
    );
  }
  if (type === 'done-friend') {
    return (
      <div style={{
        width: size, height: size,
        background: accent,
        borderRadius: 2,
      }} />
    );
  }
  if (type === 'miss-user' || type === 'miss-friend') {
    return (
      <div style={{
        width: size, height: size,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: monoFont, fontSize: size * 0.65, color: type === 'miss-friend' ? accent : inkSoft,
        opacity: 0.6,
      }}>
        ×
      </div>
    );
  }
  return <div style={{ width: size, height: size, opacity: 0.2,
    border: `1px dashed ${inkFaint}`, borderRadius: 2,
  }} />;
}

function getStreak(habitId, userId, checkins, config, upToDay) {
  let streak = 0;
  const habit = config.habits.find(h => h.id === habitId);
  if (!habit) return 0;
  for (let d = upToDay - 1; d >= habit.revealDay; d--) {
    const date = formatDate(addDays(config.startDate, d - 1));
    if (checkins[date]?.[userId]?.[habitId]?.done) {
      streak++;
    } else break;
  }
  return streak;
}

function HabitGridRow({ habit, userId, friendId, checkins, config, dayNum, maxDays, userColor, friendColor, isMobile }) {
  const rampDays = config.rampDays || 15;

  const getCellType = (day, uid) => {
    if (day > dayNum) return 'future';
    if (habit.revealDay > day) return 'before-reveal';
    const date = formatDate(addDays(config.startDate, day - 1));
    const data = checkins[date]?.[uid]?.[habit.id];
    if (data?.done) return uid === userId ? 'done-user' : 'done-friend';
    if (day < dayNum) return uid === userId ? 'miss-user' : 'miss-friend';
    return 'empty';
  };

  const userStreak = getStreak(habit.id, userId, checkins, config, dayNum);
  const friendStreak = getStreak(habit.id, friendId, checkins, config, dayNum);
  const cellSize = isMobile ? 16 : 20;
  const gap = isMobile ? 2 : 3;

  return (
    <div style={{ marginBottom: 2 }}>
      {/* User row */}
      <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: 1 }}>
        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
          <GridCell key={d} type={getCellType(d, userId)} isMobile={isMobile} />
        ))}
        <span style={{
          fontFamily: monoFont, fontSize: 11, color: inkSoft,
          marginLeft: 6, whiteSpace: 'nowrap',
        }}>
          {userStreak > 0 ? `${userStreak}` : ''}
        </span>
      </div>
      {/* Friend row */}
      <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: 8 }}>
        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
          <GridCell key={d} type={getCellType(d, friendId)} isMobile={isMobile} />
        ))}
        <span style={{
          fontFamily: monoFont, fontSize: 11, color: accent,
          marginLeft: 6, whiteSpace: 'nowrap',
        }}>
          {friendStreak > 0 ? `${friendStreak}` : ''}
        </span>
      </div>
    </div>
  );
}

export default function GridMap({ appData, userId, friendId, dayNum, totalDays, isMobile }) {
  const { config, checkins = {} } = appData;
  const rampDays = config.rampDays || 15;
  const revealedHabits = config.habits.filter(h => h.revealDay <= dayNum);
  const maxDays = isMobile ? Math.min(15, dayNum + 1) : totalDays;
  const userName = config.users[userId]?.name || 'You';
  const friendName = config.users[friendId]?.name || 'Friend';

  const cellSize = isMobile ? 16 : 20;
  const gap = isMobile ? 2 : 3;

  return (
    <Paper style={{ height: '100%', overflowY: 'auto', overflowX: 'auto', padding: isMobile ? '16px 12px 80px' : '24px 28px 40px' }}>
      {/* Title */}
      <div style={{ fontFamily: titleFont, fontSize: isMobile ? 28 : 36, color: ink, marginBottom: 4 }}>
        The grid
      </div>
      <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft, marginBottom: 20 }}>
        Each row: <span style={{ color: ink }}>■</span> {userName} above, <span style={{ color: accent }}>■</span> {friendName} below
        {isMobile && ' · Showing first 15 days'}
      </div>

      {/* Day column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: 6, paddingLeft: 0 }}>
        <div style={{ width: isMobile ? 80 : 120, flexShrink: 0 }} />
        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
          <div
            key={d}
            style={{
              width: cellSize,
              textAlign: 'center',
              fontFamily: monoFont,
              fontSize: 9,
              color: d === dayNum ? accent : d === rampDays ? inkSoft : inkFaint,
              fontWeight: d === dayNum ? 600 : 400,
              flexShrink: 0,
              borderLeft: d === rampDays + 1 ? `1px dashed ${inkFaint}` : 'none',
            }}
          >
            {d}
          </div>
        ))}
        <div style={{ width: 40 }} />
      </div>

      {/* Habits */}
      {revealedHabits.length === 0 && (
        <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '24px 0' }}>
          No habits unlocked yet.
        </div>
      )}

      {revealedHabits.map(habit => (
        <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
          {/* Habit name */}
          <div style={{
            width: isMobile ? 80 : 120,
            flexShrink: 0,
            fontFamily: handFont,
            fontSize: isMobile ? 12 : 14,
            color: ink,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            paddingTop: 2,
          }}>
            {habit.name}
          </div>
          <HabitGridRow
            habit={habit}
            userId={userId}
            friendId={friendId}
            checkins={checkins}
            config={config}
            dayNum={dayNum}
            maxDays={maxDays}
            isMobile={isMobile}
          />
        </div>
      ))}

      {/* Legend */}
      <div style={{
        marginTop: 24,
        display: 'flex', flexWrap: 'wrap', gap: 16,
        padding: '12px 16px',
        background: 'rgba(31,26,20,0.03)',
        borderRadius: 6,
      }}>
        {[
          { color: ink, label: `${userName} done` },
          { color: accent, label: `${friendName} done` },
          { type: 'miss', label: 'miss' },
          { type: 'hatch', label: 'not yet unlocked' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: handFont, fontSize: 12, color: inkSoft }}>
            {item.color ? (
              <div style={{ width: 12, height: 12, background: item.color, borderRadius: 2 }} />
            ) : item.type === 'miss' ? (
              <div style={{ width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: monoFont, fontSize: 10, color: inkSoft, opacity: 0.6 }}>×</div>
            ) : (
              <div style={{
                width: 12, height: 12,
                background: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(31,26,20,0.15) 2px, rgba(31,26,20,0.15) 3px)`,
                borderRadius: 2,
              }} />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </Paper>
  );
}
