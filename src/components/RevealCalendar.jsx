import { useState } from 'react';
import { getDayNum } from '../lib/utils.js';
import { bg, paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../constants.js';
import { Paper } from './primitives.jsx';

export default function RevealCalendar({ config, userId, onDone, isMobile }) {
  const dayNum = getDayNum(config.startDate);
  const habits = config.habits || [];
  const rampDays = config.rampDays || 15;

  const [revealed, setRevealed] = useState(false);
  const [revealAnim, setRevealAnim] = useState(false);

  const handleReveal = () => {
    setRevealAnim(true);
    setTimeout(() => {
      setRevealed(true);
      // Store that we've seen today's reveal
      localStorage.setItem(`habit-revealed-${userId}`, String(dayNum));
    }, 400);
  };

  const todayHabit = habits.find(h => h.revealDay === dayNum);

  const getTileState = (day) => {
    if (day < dayNum) return 'past';
    if (day === dayNum) return 'today';
    return 'future';
  };

  const getHabit = (day) => habits.find(h => h.revealDay === day);

  const typeIcon = (type) => type === 'num' ? '123' : '☑';

  // 5x3 grid (desktop) or 3x5 (mobile)
  const cols = isMobile ? 3 : 5;

  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }}>
      <Paper style={{
        width: '100%', maxWidth: 640, height: 'auto',
        borderRadius: 12,
        padding: isMobile ? '28px 16px' : '40px 48px',
        boxShadow: '0 4px 24px rgba(31,26,20,0.08)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: titleFont, fontSize: isMobile ? 32 : 40, color: ink, marginBottom: 4 }}>
            Day {dayNum} — new habit unlocks!
          </div>
          <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft }}>
            Tap today's tile to reveal your next habit
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: isMobile ? 8 : 12,
          marginBottom: 32,
        }}>
          {Array.from({ length: rampDays }, (_, i) => i + 1).map(day => {
            const tileState = getTileState(day);
            const habit = getHabit(day);
            const isToday = tileState === 'today';
            const isPast = tileState === 'past';

            return (
              <div
                key={day}
                onClick={isToday && !revealed ? handleReveal : undefined}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 4px',
                  cursor: isToday && !revealed ? 'pointer' : 'default',
                  background: isPast
                    ? paperShade
                    : isToday
                    ? (revealed ? accentSoft : 'transparent')
                    : 'transparent',
                  border: isToday
                    ? `2px solid ${accent}`
                    : isPast
                    ? `1px solid ${inkFaint}`
                    : `1px dashed ${inkFaint}`,
                  boxShadow: isToday ? `0 0 0 ${revealed ? 0 : 6}px rgba(196,122,61,0.15)` : 'none',
                  animation: isToday && !revealed ? 'pulse-ring 2s infinite' : 'none',
                  opacity: tileState === 'future' ? 0.45 : 1,
                  transition: 'all 0.3s',
                  overflow: 'hidden',
                }}
              >
                {/* Day number */}
                <div style={{
                  fontFamily: monoFont,
                  fontSize: isMobile ? 10 : 12,
                  color: isToday ? accent : inkSoft,
                  marginBottom: 3,
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {day}
                </div>

                {/* Content */}
                {isPast && habit && (
                  <>
                    <div style={{
                      fontFamily: handFont,
                      fontSize: isMobile ? 11 : 12,
                      color: ink,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {habit.name}
                    </div>
                    <div style={{
                      marginTop: 3,
                      fontFamily: monoFont, fontSize: 10, color: inkSoft,
                    }}>
                      {typeIcon(habit.type)}
                    </div>
                  </>
                )}

                {isToday && !revealed && (
                  <div style={{
                    fontFamily: titleFont,
                    fontSize: isMobile ? 28 : 36,
                    color: accent,
                    opacity: revealAnim ? 0 : 1,
                    transition: 'opacity 0.3s',
                  }}>
                    ?
                  </div>
                )}

                {isToday && revealed && todayHabit && (
                  <div style={{ animation: 'fade-in 0.4s ease', textAlign: 'center' }}>
                    <div style={{
                      fontFamily: handFont,
                      fontSize: isMobile ? 11 : 13,
                      color: ink,
                      lineHeight: 1.3,
                    }}>
                      {todayHabit.name}
                    </div>
                    <div style={{
                      marginTop: 3,
                      fontFamily: monoFont, fontSize: 10, color: accent,
                    }}>
                      {typeIcon(todayHabit.type)}
                    </div>
                  </div>
                )}

                {tileState === 'future' && (
                  <div style={{
                    fontFamily: handFont, fontSize: isMobile ? 16 : 20,
                    color: inkFaint,
                  }}>
                    ·
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Revealed habit detail */}
        {revealed && todayHabit && (
          <div style={{
            textAlign: 'center',
            marginBottom: 24,
            padding: '16px 24px',
            background: accentSoft,
            borderRadius: 10,
            animation: 'fade-in 0.5s ease',
          }}>
            <div style={{ fontFamily: titleFont, fontSize: 28, color: ink, marginBottom: 4 }}>
              {todayHabit.name}
            </div>
            {todayHabit.type === 'num' && (
              <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft }}>
                Target: {todayHabit.target} {todayHabit.unit} per day
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        {revealed && (
          <div style={{ textAlign: 'center', animation: 'fade-in 0.6s ease' }}>
            <button
              onClick={onDone}
              style={{
                padding: '13px 36px',
                background: ink,
                color: paper,
                border: 'none',
                borderRadius: 8,
                fontFamily: titleFont,
                fontSize: 22,
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Let's go →
            </button>
          </div>
        )}

        {!revealed && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onDone}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: handFont, fontSize: 14, color: inkSoft,
                padding: '4px 8px',
              }}
            >
              Skip reveal →
            </button>
          </div>
        )}

      </Paper>
    </div>
  );
}
