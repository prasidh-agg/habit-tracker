import { useState } from 'react';
import { getDayNum, todayStr, formatDate, addDays, getTotalScore, getOverallCompletion, getCompletionHistory } from '../../lib/utils.js';
import { paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../../constants.js';
import { Check, Paper, SketchBox, Caption } from '../primitives.jsx';

function Sparkline({ data, color, dashed = false, height = 60 }) {
  if (!data || data.length === 0) return <div style={{ height }} />;
  const max = 100;
  const w = 100;
  const h = height;
  const pts = data.map((v, i) =>
    `${(i / Math.max(data.length - 1, 1)) * w},${h - (v / max) * h}`
  ).join(' ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      {data.length > 1 && (
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeDasharray={dashed ? '3 2' : 'none'}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* dots at each point */}
      {data.map((v, i) => (
        <circle
          key={i}
          cx={`${(i / Math.max(data.length - 1, 1)) * w}`}
          cy={`${h - (v / max) * h}`}
          r="2"
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function HabitRowCompact({ habit, checkinData, isOwn, onToggle, isMobile }) {
  const done = checkinData?.done || false;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '5px 0',
      borderBottom: `1px solid ${inkFaint}`,
      minHeight: 32,
    }}>
      <Check
        state={done ? 'checked' : 'empty'}
        size={18}
        onClick={isOwn ? () => onToggle(habit.id, !done) : undefined}
      />
      <span style={{
        flex: 1,
        fontFamily: handFont,
        fontSize: isMobile ? 14 : 15,
        color: done ? inkSoft : ink,
        textDecoration: done && !isOwn ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {habit.name}
      </span>
    </div>
  );
}

export default function RaceTrack({ appData, userId, friendId, dayNum, totalDays, onMutate, isMobile }) {
  const { config, checkins = {} } = appData;
  const today = todayStr();
  const rampDays = config.rampDays || 15;
  const activeHabits = config.habits.filter(h => h.revealDay <= dayNum);

  const userName = config.users[userId]?.name || 'You';
  const friendName = config.users[friendId]?.name || 'Friend';

  const userScore = getTotalScore(userId, checkins, config);
  const friendScore = getTotalScore(friendId, checkins, config);
  const userPct = getOverallCompletion(userId, checkins, config);
  const friendPct = getOverallCompletion(friendId, checkins, config);

  const userHistory = getCompletionHistory(userId, checkins, config, totalDays);
  const friendHistory = getCompletionHistory(friendId, checkins, config, totalDays);

  const userCheckins = checkins[today]?.[userId] || {};
  const friendCheckins = checkins[today]?.[friendId] || {};

  const handleToggle = (habitId, done) => {
    const nextCheckins = {
      ...checkins,
      [today]: {
        ...checkins[today],
        [userId]: {
          ...userCheckins,
          [habitId]: { ...userCheckins[habitId], done },
        },
      },
    };
    onMutate({ ...appData, checkins: nextCheckins }, habitId, done);
  };

  const userLeads = userScore >= friendScore;

  return (
    <Paper style={{ height: '100%', overflowY: 'auto', padding: isMobile ? '16px 14px 80px' : '24px 28px 40px' }}>
      {/* Header */}
      <div style={{
        fontFamily: titleFont, fontSize: isMobile ? 28 : 38, color: ink, marginBottom: 16,
      }}>
        You vs {friendName}
      </div>

      {/* Score boxes */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <SketchBox style={{ flex: 1, textAlign: 'center', padding: '14px 12px' }}>
          <div style={{ fontFamily: titleFont, fontSize: 15, color: ink, marginBottom: 4 }}>
            {userName} {userLeads && userScore > friendScore ? '👑' : ''}
          </div>
          <div style={{ fontFamily: monoFont, fontSize: isMobile ? 28 : 36, color: ink, fontWeight: 600 }}>
            {userScore}
          </div>
          <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft }}>completions</div>
          <div style={{
            marginTop: 6,
            fontFamily: monoFont, fontSize: 14,
            color: ink,
            padding: '2px 8px',
            background: 'rgba(31,26,20,0.06)',
            borderRadius: 4,
            display: 'inline-block',
          }}>
            {userPct}%
          </div>
        </SketchBox>

        <SketchBox style={{ flex: 1, textAlign: 'center', padding: '14px 12px' }}>
          <div style={{ fontFamily: titleFont, fontSize: 15, color: accent, marginBottom: 4 }}>
            {friendName} {!userLeads && userScore < friendScore ? '👑' : ''}
          </div>
          <div style={{ fontFamily: monoFont, fontSize: isMobile ? 28 : 36, color: accent, fontWeight: 600 }}>
            {friendScore}
          </div>
          <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft }}>completions</div>
          <div style={{
            marginTop: 6,
            fontFamily: monoFont, fontSize: 14,
            color: accent,
            padding: '2px 8px',
            background: accentSoft,
            borderRadius: 4,
            display: 'inline-block',
          }}>
            {friendPct}%
          </div>
        </SketchBox>
      </div>

      {/* Completion rate sparkline */}
      {(userHistory.length > 0 || friendHistory.length > 0) && (
        <SketchBox style={{ marginBottom: 20 }}>
          <Caption>Daily completion rate</Caption>
          <div style={{ position: 'relative' }}>
            {/* Y axis labels */}
            <div style={{
              position: 'absolute', left: -24, top: 0, bottom: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              pointerEvents: 'none',
            }}>
              {[100, 50, 0].map(v => (
                <span key={v} style={{ fontFamily: monoFont, fontSize: 9, color: inkFaint }}>
                  {v}
                </span>
              ))}
            </div>

            {/* Grid lines */}
            <div style={{ position: 'relative' }}>
              {[0, 25, 50, 75, 100].map(pct => (
                <div
                  key={pct}
                  style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    top: `${100 - pct}%`,
                    borderTop: `1px dashed ${inkFaint}`,
                    opacity: 0.5,
                    pointerEvents: 'none',
                  }}
                />
              ))}
              <Sparkline data={userHistory} color={ink} height={isMobile ? 50 : 70} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Sparkline data={friendHistory} color={accent} dashed height={isMobile ? 50 : 70} />
              </div>
            </div>

            {/* X axis: day labels */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: monoFont, fontSize: 9, color: inkFaint, marginTop: 3,
            }}>
              <span>1</span>
              <span>{Math.round(totalDays / 2)}</span>
              <span>{totalDays}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: handFont, fontSize: 12, color: inkSoft }}>
              <div style={{ width: 20, height: 2, background: ink }} />
              {userName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: handFont, fontSize: 12, color: inkSoft }}>
              <svg width={20} height={4} viewBox="0 0 20 4">
                <line x1="0" y1="2" x2="20" y2="2" stroke={accent} strokeWidth="1.8" strokeDasharray="3 2" />
              </svg>
              {friendName}
            </div>
          </div>
        </SketchBox>
      )}

      {/* Side-by-side today's habits */}
      <div style={{ fontFamily: titleFont, fontSize: 20, color: ink, marginBottom: 10 }}>
        Today's habits
      </div>

      {isMobile ? (
        // Mobile: stacked
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: titleFont, fontSize: 16, color: ink, marginBottom: 6 }}>
              {userName}
            </div>
            {activeHabits.map(h => (
              <HabitRowCompact
                key={h.id}
                habit={h}
                checkinData={userCheckins[h.id]}
                isOwn={true}
                onToggle={handleToggle}
                isMobile={isMobile}
              />
            ))}
          </div>
          <div>
            <div style={{ fontFamily: titleFont, fontSize: 16, color: accent, marginBottom: 6 }}>
              {friendName}
            </div>
            {activeHabits.map(h => (
              <HabitRowCompact
                key={h.id}
                habit={h}
                checkinData={friendCheckins[h.id]}
                isOwn={false}
                onToggle={() => {}}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      ) : (
        // Desktop: side by side
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div style={{
              fontFamily: titleFont, fontSize: 18, color: ink,
              marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${inkFaint}`,
            }}>
              {userName}
            </div>
            {activeHabits.map(h => (
              <HabitRowCompact
                key={h.id}
                habit={h}
                checkinData={userCheckins[h.id]}
                isOwn={true}
                onToggle={handleToggle}
                isMobile={false}
              />
            ))}
          </div>

          {/* Dashed divider */}
          <div style={{
            width: 1, borderLeft: `2px dashed ${inkFaint}`,
            flexShrink: 0, alignSelf: 'stretch',
          }} />

          <div style={{ flex: 1, paddingLeft: 20 }}>
            <div style={{
              fontFamily: titleFont, fontSize: 18, color: accent,
              marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${inkFaint}`,
            }}>
              {friendName}
            </div>
            {activeHabits.map(h => (
              <HabitRowCompact
                key={h.id}
                habit={h}
                checkinData={friendCheckins[h.id]}
                isOwn={false}
                onToggle={() => {}}
                isMobile={false}
              />
            ))}
          </div>
        </div>
      )}

      {activeHabits.length === 0 && (
        <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '16px 0' }}>
          No habits unlocked yet.
        </div>
      )}
    </Paper>
  );
}
