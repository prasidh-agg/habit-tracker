import { useState } from 'react';
import { setupChallenge, reconfigureChallenge } from '../lib/api.js';
import { bg, paper, paperShade, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../constants.js';
import { SketchBox, Paper, Caption } from './primitives.jsx';
import { todayStr } from '../lib/utils.js';

const DEFAULT_HABITS = [
  { id: 'h1',  revealDay: 1,  name: '10,000 steps',     type: 'num',   target: 10000, unit: 'steps' },
  { id: 'h2',  revealDay: 2,  name: 'Meditate',          type: 'num',   target: 5,     unit: 'min'   },
  { id: 'h3',  revealDay: 3,  name: 'Read',              type: 'num',   target: 20,    unit: 'pages' },
  { id: 'h4',  revealDay: 4,  name: 'No phone in bed',   type: 'check', target: null,  unit: ''      },
  { id: 'h5',  revealDay: 5,  name: 'Cold shower',       type: 'check', target: null,  unit: ''      },
  { id: 'h6',  revealDay: 6,  name: 'Drink 2L water',    type: 'num',   target: 2,     unit: 'L'     },
  { id: 'h7',  revealDay: 7,  name: 'Stretch',           type: 'num',   target: 10,    unit: 'min'   },
  { id: 'h8',  revealDay: 8,  name: 'Journal',           type: 'check', target: null,  unit: ''      },
  { id: 'h9',  revealDay: 9,  name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h10', revealDay: 10, name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h11', revealDay: 11, name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h12', revealDay: 12, name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h13', revealDay: 13, name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h14', revealDay: 14, name: '',                  type: 'check', target: null,  unit: ''      },
  { id: 'h15', revealDay: 15, name: '',                  type: 'check', target: null,  unit: ''      },
];

// Restart pre-fill: keep the existing habits, but shift the reveal schedule so
// every habit already unlocked (revealDay <= currentDay) lands on Day 1, and the
// rest keep unlocking one day at a time after that.
function restartHabits(config, currentDay) {
  const day = Math.max(1, currentDay || 1);
  return (config?.habits || []).map(h => ({
    id: h.id,
    revealDay: Math.max(1, (h.revealDay || 1) - day + 1),
    name: h.name || '',
    type: h.type || 'check',
    target: h.target ?? null,
    unit: h.unit || '',
  }));
}

export default function SetupScreen({ onComplete, onCancel, isMobile, mode = 'setup', initialConfig = null, currentDay = 1 }) {
  const isRestart = mode === 'restart';
  const [habits, setHabits] = useState(() =>
    isRestart ? restartHabits(initialConfig, currentDay) : DEFAULT_HABITS.map(h => ({ ...h }))
  );
  const [startDate, setStartDate] = useState(todayStr());
  const [rampDays, setRampDays] = useState(isRestart ? (initialConfig?.rampDays || 15) : 15);
  const [practiceDays, setPracticeDays] = useState(isRestart ? (initialConfig?.practiceDays || 15) : 15);
  const [prasPin, setPrasPin] = useState('');
  const [aniPin, setAniPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const updateHabit = (idx, field, val) => {
    setHabits(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === 'type' && val === 'check') {
        next[idx].target = null;
        next[idx].unit = '';
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!startDate) { setErr('Please set a start date.'); return; }
    if (!isRestart) {
      if (prasPin.length !== 4 || !/^\d{4}$/.test(prasPin)) { setErr("Prasidh's PIN must be 4 digits."); return; }
      if (aniPin.length !== 4 || !/^\d{4}$/.test(aniPin)) { setErr("Anisha's PIN must be 4 digits."); return; }
    }
    const filledHabits = habits.filter(h => h.name.trim());
    if (filledHabits.length === 0) { setErr('Add at least one habit.'); return; }

    setSubmitting(true);
    setErr('');
    try {
      const habitPayload = filledHabits.map((h, i) => ({
        id: h.id || `h${i + 1}`,
        revealDay: Number(h.revealDay) || i + 1,
        name: h.name.trim(),
        type: h.type,
        target: h.type === 'num' ? Number(h.target) : null,
        unit: h.type === 'num' ? h.unit : '',
      }));
      const configObj = {
        startDate,
        rampDays: Number(rampDays),
        practiceDays: Number(practiceDays),
        habits: habitPayload,
      };
      if (isRestart) {
        await reconfigureChallenge({ config: configObj });
        // Hand the exact written config back so the app doesn't have to rely on
        // an immediate (eventually-consistent) re-read of the store.
        onComplete(configObj);
      } else {
        await setupChallenge({
          config: {
            ...configObj,
            users: {
              prasidh: { name: 'Prasidh', initial: 'P', pin: prasPin },
              anisha:  { name: 'Anisha',  initial: 'A', pin: aniPin  },
            },
          },
        });
        onComplete();
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${inkFaint}`,
    outline: 'none',
    fontFamily: handFont,
    fontSize: 16,
    color: ink,
    padding: '2px 4px',
    width: '100%',
  };

  const smallInput = {
    ...inputStyle,
    width: 60,
    textAlign: 'center',
    fontSize: 14,
  };

  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      <Paper style={{ minHeight: '100%', height: 'auto', padding: isMobile ? '24px 16px 80px' : '40px 48px 80px', overflow: 'visible' }}>

        {/* Title */}
        <div style={{ marginBottom: 32, textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ fontFamily: titleFont, fontSize: isMobile ? 52 : 64, color: ink, lineHeight: 1, marginBottom: 4 }}>
            {isRestart ? 'Restart' : 'The 15'}
          </div>
          <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft }}>
            {isRestart
              ? 'Wipe check-ins and restart the challenge from today'
              : 'Set up your 30-day challenge together'}
          </div>
        </div>

        {/* Habits table */}
        <SketchBox style={{ marginBottom: 32 }}>
          <Caption style={{ marginBottom: 12 }}>
            {isRestart ? 'Habits & reveal day (Day = day it unlocks; 1 = today)' : 'Your 15 habits (one unlocks each day)'}
          </Caption>

          {/* Header */}
          {!isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '28px 1fr 80px 70px 80px',
              gap: 8,
              alignItems: 'center',
              marginBottom: 6,
              paddingBottom: 6,
              borderBottom: `1px solid ${inkFaint}`,
            }}>
              <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>#</span>
              <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>Habit name</span>
              <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft, textAlign: 'center' }}>Type</span>
              <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft, textAlign: 'center' }}>Target</span>
              <span style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>Unit</span>
            </div>
          )}

          {habits.map((h, i) => (
            <div key={h.id} style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '24px 1fr 70px' : '28px 1fr 80px 70px 80px',
              gap: 8,
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: i < habits.length - 1 ? `1px solid ${inkFaint}` : 'none',
            }}>
              {/* Day number — editable reveal day in restart mode */}
              {isRestart ? (
                <input
                  type="number"
                  min={1}
                  value={h.revealDay}
                  onChange={e => updateHabit(i, 'revealDay', e.target.value)}
                  title="Reveal day"
                  style={{
                    width: '100%', textAlign: 'center',
                    background: 'transparent', border: `1px solid ${inkFaint}`,
                    borderRadius: 4, outline: 'none',
                    fontFamily: monoFont, fontSize: 12, color: ink, padding: '2px 0',
                  }}
                />
              ) : (
                <span style={{ fontFamily: monoFont, fontSize: 12, color: inkSoft, textAlign: 'center' }}>
                  {i + 1}
                </span>
              )}

              {/* Name */}
              <input
                type="text"
                value={h.name}
                onChange={e => updateHabit(i, 'name', e.target.value)}
                placeholder={`Habit ${i + 1}`}
                style={{ ...inputStyle, fontSize: 15 }}
              />

              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                <button
                  onClick={() => updateHabit(i, 'type', 'check')}
                  style={{
                    padding: '2px 8px', fontSize: 13, fontFamily: handFont,
                    border: `1px solid ${h.type === 'check' ? ink : inkFaint}`,
                    background: h.type === 'check' ? ink : 'transparent',
                    color: h.type === 'check' ? paper : inkSoft,
                    borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  ☑
                </button>
                <button
                  onClick={() => updateHabit(i, 'type', 'num')}
                  style={{
                    padding: '2px 8px', fontSize: 13, fontFamily: handFont,
                    border: `1px solid ${h.type === 'num' ? ink : inkFaint}`,
                    background: h.type === 'num' ? ink : 'transparent',
                    color: h.type === 'num' ? paper : inkSoft,
                    borderRadius: 4, cursor: 'pointer',
                  }}
                >
                  123
                </button>
              </div>

              {/* Target */}
              {!isMobile && (
                <input
                  type="number"
                  value={h.type === 'num' ? (h.target ?? '') : ''}
                  onChange={e => updateHabit(i, 'target', e.target.value)}
                  disabled={h.type === 'check'}
                  placeholder={h.type === 'num' ? '—' : ''}
                  style={{ ...smallInput, opacity: h.type === 'check' ? 0.3 : 1 }}
                />
              )}

              {/* Unit */}
              {!isMobile && (
                <input
                  type="text"
                  value={h.unit || ''}
                  onChange={e => updateHabit(i, 'unit', e.target.value)}
                  disabled={h.type === 'check'}
                  placeholder={h.type === 'num' ? 'unit' : ''}
                  style={{ ...inputStyle, fontSize: 14, opacity: h.type === 'check' ? 0.3 : 1 }}
                />
              )}

              {/* Mobile: target+unit combined */}
              {isMobile && h.type === 'num' && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={h.target ?? ''}
                    onChange={e => updateHabit(i, 'target', e.target.value)}
                    placeholder="—"
                    style={{ ...inputStyle, width: 40, textAlign: 'center', fontSize: 13 }}
                  />
                  <input
                    type="text"
                    value={h.unit || ''}
                    onChange={e => updateHabit(i, 'unit', e.target.value)}
                    placeholder="unit"
                    style={{ ...inputStyle, width: 40, fontSize: 13 }}
                  />
                </div>
              )}
              {isMobile && h.type === 'check' && (
                <div style={{ fontFamily: handFont, fontSize: 12, color: inkFaint }}>check</div>
              )}
            </div>
          ))}
        </SketchBox>

        {/* Config */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isRestart ? '1fr' : '1fr 1fr',
          gap: 16,
          marginBottom: 32,
        }}>
          <SketchBox>
            <Caption>Challenge settings</Caption>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: handFont, fontSize: 15 }}>
                <span style={{ color: inkSoft, minWidth: 80 }}>Start date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flex: 1 }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: handFont, fontSize: 15 }}>
                <span style={{ color: inkSoft, minWidth: 80 }}>Ramp days</span>
                <input
                  type="number"
                  value={rampDays}
                  onChange={e => setRampDays(e.target.value)}
                  min={1} max={20}
                  style={{ ...smallInput, width: 60 }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: handFont, fontSize: 15 }}>
                <span style={{ color: inkSoft, minWidth: 80 }}>Practice days</span>
                <input
                  type="number"
                  value={practiceDays}
                  onChange={e => setPracticeDays(e.target.value)}
                  min={1} max={30}
                  style={{ ...smallInput, width: 60 }}
                />
              </label>
            </div>
          </SketchBox>

          {!isRestart && (
          <SketchBox>
            <Caption>PINs (4 digits)</Caption>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: handFont, fontSize: 15 }}>
                <span style={{ color: inkSoft, minWidth: 100 }}>Prasidh's PIN</span>
                <input
                  type="password"
                  value={prasPin}
                  onChange={e => setPrasPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  style={{ ...smallInput, width: 70, letterSpacing: '0.2em' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: handFont, fontSize: 15 }}>
                <span style={{ color: inkSoft, minWidth: 100 }}>Anisha's PIN</span>
                <input
                  type="password"
                  value={aniPin}
                  onChange={e => setAniPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  style={{ ...smallInput, width: 70, letterSpacing: '0.2em' }}
                />
              </label>
            </div>
          </SketchBox>
          )}
        </div>

        {/* Warning */}
        <div style={{
          marginBottom: 24,
          fontFamily: handFont, fontSize: 14, color: inkSoft,
          padding: '8px 12px',
          background: accentSoft,
          borderRadius: 6,
          borderLeft: `3px solid ${accent}`,
        }}>
          {isRestart
            ? 'This wipes all check-ins and restarts the challenge from your start date. Your PINs stay the same. This can\'t be undone.'
            : "Once you start, habits can't be edited. Choose carefully!"}
        </div>

        {/* Error */}
        {err && (
          <div style={{
            marginBottom: 16, fontFamily: handFont, fontSize: 14, color: '#b33',
            padding: '8px 12px', background: '#fff0f0', borderRadius: 6,
          }}>
            {err}
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '14px 36px',
              background: submitting ? inkSoft : ink,
              color: paper,
              border: 'none',
              borderRadius: 8,
              fontFamily: titleFont,
              fontSize: 22,
              cursor: submitting ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {isRestart
              ? (submitting ? 'Restarting...' : 'Restart & wipe check-ins →')
              : (submitting ? 'Setting up...' : 'Lock in & start →')}
          </button>
          {isRestart && onCancel && (
            <button
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: inkSoft,
                border: `1px solid ${inkFaint}`,
                borderRadius: 8,
                fontFamily: titleFont,
                fontSize: 20,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>

      </Paper>
    </div>
  );
}
