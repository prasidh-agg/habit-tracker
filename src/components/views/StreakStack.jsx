import { getDayNum, todayStr, formatDate, addDays, getStreak, getOverallCompletion } from '../../lib/utils.js';
import { paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../../constants.js';
import { Check, Dot, Paper, SketchBox, Caption } from '../primitives.jsx';

function Sparkline({ habitId, userId, checkins, config, dayNum, count = 14 }) {
  const dots = [];
  for (let d = Math.max(1, dayNum - count + 1); d <= dayNum; d++) {
    const date = formatDate(addDays(config.startDate, d - 1));
    const habit = config.habits.find(h => h.id === habitId);
    if (!habit || habit.revealDay > d) {
      dots.push('before');
    } else if (d === dayNum) {
      const done = checkins[date]?.[userId]?.[habitId]?.done;
      dots.push(done ? 'done' : 'today');
    } else {
      const done = checkins[date]?.[userId]?.[habitId]?.done;
      dots.push(done ? 'done' : 'miss');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {dots.map((state, i) => (
        state === 'before'
          ? <div key={i} style={{ width: 12, height: 12, opacity: 0.2 }}>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <line x1="1" y1="11" x2="11" y2="1" stroke={inkFaint} strokeWidth="1" />
              </svg>
            </div>
          : <Dot key={i} state={state} />
      ))}
    </div>
  );
}

export default function StreakStack({ appData, userId, friendId, dayNum, totalDays, onMutate, isMobile }) {
  const { config, checkins = {} } = appData;
  const today = todayStr();
  const revealedHabits = config.habits.filter(h => h.revealDay <= dayNum);

  const userName = config.users[userId]?.name || 'You';
  const friendName = config.users[friendId]?.name || 'Friend';

  const userCompletion = getOverallCompletion(userId, checkins, config);
  const friendCompletion = getOverallCompletion(friendId, checkins, config);

  const userCheckins = checkins[today]?.[userId] || {};
  const friendCheckins = checkins[today]?.[friendId] || {};

  const handleToggle = (habitId) => {
    const current = userCheckins[habitId]?.done || false;
    const nextCheckins = {
      ...checkins,
      [today]: {
        ...checkins[today],
        [userId]: {
          ...userCheckins,
          [habitId]: { ...userCheckins[habitId], done: !current },
        },
      },
    };
    onMutate({ ...appData, checkins: nextCheckins }, habitId, !current);
  };

  const progressPct = ((dayNum - 1) / (totalDays - 1)) * 100;

  return (
    <Paper style={{ height: '100%', overflowY: 'auto', padding: isMobile ? '16px 14px 80px' : '24px 28px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontFamily: titleFont, fontSize: isMobile ? 34 : 42, color: ink }}>
          Streaks
        </div>
        <div style={{ display: 'flex', gap: isMobile ? 8 : 16, paddingTop: 6 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: monoFont, fontSize: isMobile ? 18 : 24, color: ink }}>{userCompletion}%</div>
            <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>{userName}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: monoFont, fontSize: isMobile ? 18 : 24, color: accent }}>{friendCompletion}%</div>
            <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>{friendName}</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          height: 6, borderRadius: 3,
          background: inkFaint,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${progressPct}%`,
            background: `linear-gradient(to right, ${ink}, ${accent})`,
            borderRadius: 3,
            transition: 'width 0.3s',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 4,
          fontFamily: handFont, fontSize: 11, color: inkSoft,
        }}>
          <span>Day 1</span>
          <span>Day {dayNum} of {totalDays}</span>
          <span>Day {totalDays}</span>
        </div>
      </div>

      {/* Habit cards */}
      {revealedHabits.length === 0 && (
        <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '24px 0', textAlign: 'center' }}>
          No habits unlocked yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {revealedHabits.map(habit => {
          const userStreak = getStreak(habit.id, userId, checkins, config);
          const friendStreak = getStreak(habit.id, friendId, checkins, config);
          const isDone = userCheckins[habit.id]?.done || false;

          return (
            <SketchBox key={habit.id} style={{ padding: isMobile ? '10px 12px' : '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* My checkbox */}
                <Check
                  state={isDone ? 'checked' : 'empty'}
                  size={20}
                  onClick={() => handleToggle(habit.id)}
                />

                {/* Habit name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: handFont, fontSize: isMobile ? 15 : 17, color: ink,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {habit.name}
                  </div>
                  {habit.type === 'num' && (
                    <div style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft }}>
                      target: {habit.target} {habit.unit}
                    </div>
                  )}
                </div>

                {/* Streaks */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontFamily: monoFont, fontSize: 14, color: ink, fontWeight: 600 }}>
                      {userStreak}
                    </span>
                    <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>streak</span>
                  </div>
                  <div style={{ fontFamily: handFont, fontSize: 11, color: accent }}>
                    {friendName.split(' ')[0]}: {friendStreak}
                  </div>
                </div>
              </div>

              {/* Sparkline dots */}
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Sparkline
                  habitId={habit.id}
                  userId={userId}
                  checkins={checkins}
                  config={config}
                  dayNum={dayNum}
                  count={isMobile ? 10 : 14}
                />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: handFont, fontSize: 11, color: accent }}>
                    {friendName.split(' ')[0]}:
                  </span>
                  <Sparkline
                    habitId={habit.id}
                    userId={friendId}
                    checkins={checkins}
                    config={config}
                    dayNum={dayNum}
                    count={isMobile ? 7 : 10}
                  />
                </div>
              </div>
            </SketchBox>
          );
        })}
      </div>
    </Paper>
  );
}
