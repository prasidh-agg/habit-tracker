import { useState } from 'react';
import { setupChallenge } from '../lib/api.js';
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

export default function SetupScreen({ onComplete, isMobile }) {
  const [habits, setHabits] = useState(DEFAULT_HABITS.map(h => ({ ...h })));
  const [startDate, setStartDate] = useState(todayStr());
  const [rampDays, setRampDays] = useState(15);
  const [practiceDays, setPracticeDays] = useState(15);
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
    if (prasPin.length !== 4 || !/^\d{4}$/.test(prasPin)) { setErr("Prasidh's PIN must be 4 digits."); return; }
    if (aniPin.length !== 4 || !/^\d{4}$/.test(aniPin)) { setErr("Anisha's PIN must be 4 digits."); return; }
    const filledHabits = habits.filter(h => h.name.trim());
    if (filledHabits.length === 0) { setErr('Add at least one habit.'); return; }

    setSubmitting(true);
    setErr('');
    try {
      await setupChallenge({
        config: {
          startDate,
          rampDays: Number(rampDays),
          practiceDays: Number(practiceDays),
          users: {
            prasidh: { name: 'Prasidh', initial: 'P', pin: prasPin },
            anisha:  { name: 'Anisha',  initial: 'A', pin: aniPin  },
          },
          habits: filledHabits.map((h, i) => ({
            id: h.id || `h${i + 1}`,
            revealDay: h.revealDay || i + 1,
            name: h.name.trim(),
            type: h.type,
            target: h.type === 'num' ? Number(h.target) : null,
            unit: h.type === 'num' ? h.unit : '',
          })),
        },
      });
      onComplete();
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
            The 15
          </div>
          <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft }}>
            Set up your 30-day challenge together
          </div>
        </div>

        {/* Habits table */}
        <SketchBox style={{ marginBottom: 32 }}>
          <Caption style={{ marginBottom: 12 }}>Your 15 habits (one unlocks each day)</Caption>

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
              {/* Day number */}
              <span style={{ fontFamily: monoFont, fontSize: 12, color: inkSoft, textAlign: 'center' }}>
                {i + 1}
              </span>

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
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
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
          Once you start, habits can't be edited. Choose carefully!
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
          {submitting ? 'Setting up...' : 'Lock in & start →'}
        </button>

      </Paper>
    </div>
  );
}
