import { useState } from 'react';
import { getDayNum, todayStr, formatDate, addDays } from '../../lib/utils.js';
import { paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../../constants.js';
import { Check, Paper } from '../primitives.jsx';

function RampBar({ dayNum, totalDays, rampDays }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 16, position: 'relative' }}>
      {Array.from({ length: totalDays }, (_, i) => {
        const d = i + 1;
        const isPast = d < dayNum;
        const isToday = d === dayNum;
        const isFuture = d > dayNum;
        const isRampEnd = d === rampDays;
        return (
          <div
            key={d}
            title={`Day ${d}`}
            style={{
              flex: 1,
              height: isToday ? 12 : 8,
              borderRadius: 2,
              background: isPast ? ink : isToday ? accent : 'transparent',
              border: isFuture ? `1px dashed ${inkFaint}` : 'none',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {isRampEnd && (
              <div style={{
                position: 'absolute', top: -16, right: -1,
                width: 1, height: 36,
                background: inkFaint,
                borderLeft: `1px dashed ${inkSoft}`,
              }} />
            )}
          </div>
        );
      })}
      {/* Ramp label */}
      <div style={{
        position: 'absolute',
        left: `${(rampDays / totalDays) * 100}%`,
        top: -20,
        transform: 'translateX(-50%)',
        fontFamily: handFont, fontSize: 10, color: inkSoft,
        whiteSpace: 'nowrap',
      }}>
        day {rampDays}
      </div>
    </div>
  );
}

function HabitRow({ habit, checkinData, isOwn, onToggle, onValueChange, isMobile }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  const done = checkinData?.done || false;
  const value = checkinData?.value;

  const handleToggle = () => {
    if (!isOwn) return;
    onToggle(habit.id, !done, value);
  };

  const openEdit = () => {
    if (!isOwn) return;
    setEditVal(value !== undefined ? String(value) : '');
    setEditing(true);
  };

  const saveEdit = () => {
    const num = parseFloat(editVal);
    if (!isNaN(num)) {
      onValueChange(habit.id, num);
    }
    setEditing(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
      borderBottom: `1px solid ${inkFaint}`,
      minHeight: 36,
    }}>
      <Check
        state={done ? 'checked' : 'empty'}
        size={isOwn ? 20 : 16}
        onClick={isOwn ? handleToggle : undefined}
      />
      <span style={{
        flex: 1,
        fontFamily: handFont,
        fontSize: isMobile ? 15 : 17,
        color: done ? inkSoft : ink,
        textDecoration: done && !isOwn ? 'line-through' : 'none',
      }}>
        {habit.name}
      </span>
      {habit.type === 'num' && (
        <>
          {isOwn && editing ? (
            <input
              autoFocus
              type="number"
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
              style={{
                width: 60, fontSize: 12, fontFamily: monoFont,
                background: 'transparent',
                border: `1px solid ${accent}`,
                borderRadius: 3, padding: '1px 4px',
                color: ink, outline: 'none',
                textAlign: 'right',
              }}
            />
          ) : (
            <span
              onClick={isOwn ? openEdit : undefined}
              style={{
                fontFamily: monoFont, fontSize: 12,
                color: done ? accent : inkSoft,
                cursor: isOwn ? 'pointer' : 'default',
                whiteSpace: 'nowrap',
                padding: '1px 4px',
                borderRadius: 3,
                border: isOwn ? `1px dashed transparent` : 'none',
              }}
              onMouseEnter={e => { if (isOwn) e.currentTarget.style.borderColor = inkFaint; }}
              onMouseLeave={e => { if (isOwn) e.currentTarget.style.borderColor = 'transparent'; }}
            >
              {value !== undefined ? value : 0}/{habit.target} {habit.unit}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function MiniCheck({ done }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
      <rect x="1" y="1" width="10" height="10" rx="1.5"
        fill="none" stroke={done ? accent : inkFaint} strokeWidth="1.2" />
      {done && (
        <path d="M2.5 6 L5 8.5 L9.5 3.5"
          fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function NotebookSpread({ appData, userId, friendId, dayNum, totalDays, onMutate, isMobile }) {
  const { config, checkins = {} } = appData;
  const today = todayStr();
  const rampDays = config.rampDays || 15;

  // Active habits for today
  const activeHabits = config.habits.filter(h => {
    if (dayNum <= rampDays) return h.revealDay <= dayNum;
    return true;
  });

  const userCheckins = checkins[today]?.[userId] || {};
  const friendCheckins = checkins[today]?.[friendId] || {};

  const handleToggle = (habitId, done, value) => {
    const nextCheckins = {
      ...checkins,
      [today]: {
        ...checkins[today],
        [userId]: {
          ...userCheckins,
          [habitId]: { done, ...(value !== undefined ? { value } : {}) },
        },
      },
    };
    onMutate({ ...appData, checkins: nextCheckins }, habitId, done, value);
  };

  const handleValueChange = (habitId, value) => {
    const current = userCheckins[habitId] || {};
    const nextCheckins = {
      ...checkins,
      [today]: {
        ...checkins[today],
        [userId]: {
          ...userCheckins,
          [habitId]: { ...current, done: current.done || value > 0, value },
        },
      },
    };
    onMutate({ ...appData, checkins: nextCheckins }, habitId, current.done || value > 0, value);
  };

  const userName = config.users[userId]?.name || 'You';
  const friendName = config.users[friendId]?.name || 'Friend';

  // Format date range header
  const startD = addDays(config.startDate, 0);
  const endD = addDays(config.startDate, totalDays - 1);
  const fmtD = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (isMobile) {
    // Mobile: just your checklist, friend's mini dots at edge
    return (
      <Paper style={{ height: '100%', overflowY: 'auto', padding: '16px 16px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: titleFont, fontSize: 34, color: ink, lineHeight: 1 }}>
              Day {dayNum}
            </div>
            <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft, marginTop: 2 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft, textAlign: 'right', paddingTop: 4 }}>
            {fmtD(startD)} — {fmtD(endD)}
          </div>
        </div>

        {/* Ramp bar */}
        <div style={{ marginBottom: 20, paddingTop: 20 }}>
          <RampBar dayNum={dayNum} totalDays={totalDays} rampDays={rampDays} />
        </div>

        {/* Column header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontFamily: titleFont, fontSize: 20, color: ink }}>{userName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontFamily: handFont, fontSize: 12, color: accent }}>{friendName}</div>
            <div style={{ display: 'flex', gap: 3 }}>
              {activeHabits.map(h => (
                <MiniCheck key={h.id} done={friendCheckins[h.id]?.done || false} />
              ))}
            </div>
          </div>
        </div>

        {/* Your habits */}
        {activeHabits.map(habit => (
          <HabitRow
            key={habit.id}
            habit={habit}
            checkinData={userCheckins[habit.id]}
            isOwn={true}
            onToggle={handleToggle}
            onValueChange={handleValueChange}
            isMobile={isMobile}
          />
        ))}

        {activeHabits.length === 0 && (
          <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '24px 0', textAlign: 'center' }}>
            No habits unlocked yet. Come back on Day 1!
          </div>
        )}
      </Paper>
    );
  }

  // Desktop: two-column spread
  return (
    <Paper style={{ height: '100%', overflowY: 'auto', padding: '24px 32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontFamily: titleFont, fontSize: 44, color: ink, lineHeight: 1 }}>
          Day {dayNum}
        </div>
        <div style={{ fontFamily: handFont, fontSize: 14, color: inkSoft, paddingBottom: 4 }}>
          {fmtD(startD)} — {fmtD(endD)}
        </div>
      </div>

      {/* Ramp bar */}
      <div style={{ marginBottom: 24, paddingTop: 24 }}>
        <RampBar dayNum={dayNum} totalDays={totalDays} rampDays={rampDays} />
      </div>

      {/* Two-column spread */}
      <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
        {/* Left column (your habits) */}
        <div style={{ flex: 1, paddingRight: 28 }}>
          <div style={{
            fontFamily: titleFont, fontSize: 26, color: ink,
            marginBottom: 12, paddingBottom: 6,
            borderBottom: `1.5px solid ${inkFaint}`,
          }}>
            {userName}
          </div>
          {activeHabits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              checkinData={userCheckins[habit.id]}
              isOwn={true}
              onToggle={handleToggle}
              onValueChange={handleValueChange}
              isMobile={false}
            />
          ))}
          {activeHabits.length === 0 && (
            <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '24px 0' }}>
              No habits unlocked yet.
            </div>
          )}
        </div>

        {/* Binding line (dashed) */}
        <div style={{
          width: 1,
          background: 'transparent',
          borderLeft: `2px dashed ${inkFaint}`,
          flexShrink: 0,
          alignSelf: 'stretch',
        }} />

        {/* Right column (friend, read-only) */}
        <div style={{ flex: 1, paddingLeft: 28 }}>
          <div style={{
            fontFamily: titleFont, fontSize: 26, color: accent,
            marginBottom: 12, paddingBottom: 6,
            borderBottom: `1.5px solid ${inkFaint}`,
          }}>
            {friendName}
          </div>
          {activeHabits.map(habit => (
            <HabitRow
              key={habit.id}
              habit={habit}
              checkinData={friendCheckins[habit.id]}
              isOwn={false}
              onToggle={() => {}}
              onValueChange={() => {}}
              isMobile={false}
            />
          ))}
          {activeHabits.length === 0 && (
            <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, padding: '24px 0' }}>
              No habits unlocked yet.
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
}
