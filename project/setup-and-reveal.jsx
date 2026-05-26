// Setup screen + daily-reveal variants for the 30-day challenge.
// The user pre-fills their 15 habits, then each day reveals one at a time.

const { useState: rvUseState, useEffect: rvUseEffect } = React;

// ============================================================
// SETUP — define all 15 habits up front
// ============================================================

const SetupScreen = ({ mobile = false }) => {
  const presetHabits = [
    { name: '10,000 steps', type: 'num', target: '10000', unit: 'steps' },
    { name: 'Meditate', type: 'num', target: '5', unit: 'min' },
    { name: 'Read', type: 'num', target: '20', unit: 'pages' },
    { name: 'No phone in bed', type: 'check', target: '', unit: '' },
    { name: 'Cold shower', type: 'check', target: '', unit: '' },
    { name: 'Drink 2L water', type: 'num', target: '2', unit: 'L' },
    { name: 'Stretch', type: 'num', target: '10', unit: 'min' },
    { name: 'Journal', type: 'check', target: '', unit: '' },
    { name: '', type: 'check', target: '', unit: '' },
    { name: '', type: 'check', target: '', unit: '' },
  ];

  const Row = ({ n, h }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: mobile ? '24px 1fr 60px' : '32px 1fr 60px 80px 50px',
      gap: 8, alignItems: 'center',
      padding: '10px 0',
      borderBottom: `1px dashed ${inkFaint}`,
    }}>
      <div style={{ fontFamily: monoFont, fontSize: mobile ? 12 : 14, color: inkSoft }}>
        {String(n).padStart(2, '0')}
      </div>
      <div style={{
        fontFamily: handFont, fontSize: mobile ? 15 : 17,
        color: h?.name ? ink : inkFaint,
        borderBottom: `1px solid ${h?.name ? 'transparent' : inkSoft}`,
        paddingBottom: 2,
      }}>
        {h?.name || (mobile ? 'habit…' : 'write your habit here…')}
      </div>
      <div style={{
        fontFamily: monoFont, fontSize: 10, color: inkSoft,
        border: `1px solid ${inkSoft}`, borderRadius: 4,
        padding: '2px 6px', textAlign: 'center',
      }}>
        {h?.type === 'num' ? '123' : '☑'}
      </div>
      {!mobile && (
        <>
          <div style={{
            fontFamily: monoFont, fontSize: 11, color: h?.target ? ink : inkFaint,
            borderBottom: `1px solid ${inkFaint}`, paddingBottom: 2,
          }}>{h?.target || '—'}</div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>{h?.unit}</div>
        </>
      )}
    </div>
  );

  return (
    <Paper style={{ padding: mobile ? '20px 16px' : '32px 40px', overflow: 'auto' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: titleFont, fontSize: mobile ? 30 : 44, lineHeight: 0.95 }}>
          The 15
        </div>
        <div style={{ fontFamily: handFont, fontSize: mobile ? 13 : 15, color: inkSoft, marginTop: 4, maxWidth: 520 }}>
          Write down all 15 habits now. One reveals each day for the first 15 days.
          You won't see them again until their day arrives.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <SketchBox style={{ padding: '8px 14px', flex: mobile ? '1 1 100%' : 'none' }}>
          <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>WHEN</div>
          <div style={{ fontFamily: handFont, fontSize: 16 }}>Starts Mon, May 26</div>
        </SketchBox>
        <SketchBox style={{ padding: '8px 14px', flex: mobile ? '1 1 100%' : 'none' }}>
          <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>WITH</div>
          <div style={{ fontFamily: handFont, fontSize: 16 }}>Jordan <span style={{color: accent}}>· J</span></div>
        </SketchBox>
        <SketchBox style={{ padding: '8px 14px', flex: mobile ? '1 1 100%' : 'none' }}>
          <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>LENGTH</div>
          <div style={{ fontFamily: handFont, fontSize: 16 }}>15 add + 15 practice</div>
        </SketchBox>
      </div>

      {!mobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 60px 80px 50px',
          gap: 8, marginBottom: 4,
          fontFamily: monoFont, fontSize: 9, color: inkSoft, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <div>#</div><div>habit</div><div>type</div><div>target</div><div>unit</div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        {Array.from({ length: mobile ? 8 : 15 }).map((_, i) => (
          <Row key={i} n={i + 1} h={presetHabits[i]} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{
          background: ink, color: paper, border: 'none',
          padding: mobile ? '10px 18px' : '12px 26px',
          borderRadius: 6, fontFamily: handFont, fontSize: mobile ? 15 : 18,
          cursor: 'pointer', letterSpacing: '0.02em',
        }}>Lock in & start →</button>
        <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>
          you can't edit after starting
        </div>
      </div>
    </Paper>
  );
};


// ============================================================
// REVEAL VARIANT A — "Advent Calendar"
// 15 numbered tiles. Past ones are open/revealed. Today's bounces.
// Future ones are sealed.
// ============================================================

const RevealCalendar = ({ mobile = false }) => {
  const day = 9;
  const habits = [
    '10k steps', 'Meditate', 'Cold shower', 'Read 20 pgs', 'No phone bed',
    'Stretch', 'Journal', '2L water', 'Run 1 mile', 'Push-ups',
    'No sugar', 'Wake 6am', 'Plan day', 'Walk after dinner', 'Lights out 10pm',
  ];
  const [opened, setOpened] = rvUseState(day);

  const Tile = ({ n }) => {
    const past = n < day;
    const today = n === day;
    const future = n > day;
    const isOpen = n <= opened;
    return (
      <div
        onClick={() => { if (n <= day) setOpened(n); }}
        style={{
          aspectRatio: '1',
          position: 'relative',
          cursor: n <= day ? 'pointer' : 'default',
          transform: today ? `rotate(-2deg) scale(${opened === day && isOpen ? 1 : 1.06})` : `rotate(${(n*13)%5 - 2}deg)`,
          transition: 'transform .4s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        {/* sealed side */}
        <div style={{
          position: 'absolute', inset: 0,
          background: future ? paperShade : (today && !isOpen ? accentSoft : paper),
          border: `1.6px solid ${future ? inkFaint : ink}`,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: isOpen ? 0 : 1,
          transition: 'opacity .25s',
          fontFamily: titleFont, fontSize: mobile ? 22 : 28,
          color: future ? inkFaint : ink,
          boxShadow: today && !isOpen ? `0 0 0 3px ${paper}, 0 0 0 4.5px ${accent}` : 'none',
        }}>
          {n}
          {today && !isOpen && (
            <div style={{
              position: 'absolute', bottom: -2, left: 0, right: 0,
              fontFamily: handFont, fontSize: 9, color: accent, textAlign: 'center',
              transform: 'rotate(2deg)',
            }}>tap!</div>
          )}
        </div>
        {/* revealed side */}
        <div style={{
          position: 'absolute', inset: 0,
          background: paper,
          border: `1.4px solid ${ink}`,
          borderRadius: 6,
          padding: mobile ? '6px 6px' : '8px 8px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity .35s .1s',
        }}>
          <div style={{ fontFamily: monoFont, fontSize: 9, color: inkSoft }}>day {n}</div>
          <div style={{ fontFamily: handFont, fontSize: mobile ? 11 : 13, lineHeight: 1.1, color: ink }}>
            {habits[n - 1]}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Paper style={{ padding: mobile ? '18px 14px' : '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: mobile ? 26 : 36, lineHeight: 1 }}>Day {day}</div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>tap today's tile to unlock</div>
        </div>
        <div style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft }}>{opened}/15 revealed</div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${mobile ? 3 : 5}, 1fr)`,
        gap: mobile ? 8 : 12,
      }}>
        {Array.from({ length: 15 }).map((_, i) => <Tile key={i} n={i + 1} />)}
      </div>

      <div style={{ marginTop: 16, fontFamily: handFont, fontSize: 12, color: inkSoft, textAlign: 'center' }}>
        ← past habits · today is glowing · sealed →
      </div>
    </Paper>
  );
};


// ============================================================
// REVEAL VARIANT B — "Envelope tear"
// A sealed envelope card for today. Drag/tap to tear open.
// ============================================================

const RevealEnvelope = ({ mobile = false }) => {
  const day = 9;
  const habit = 'Cold shower';
  const [open, setOpen] = rvUseState(false);

  return (
    <Paper style={{ padding: mobile ? '18px 14px' : '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: titleFont, fontSize: mobile ? 26 : 36, lineHeight: 1 }}>Day {day}</div>
        <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>your next habit is sealed</div>
      </div>

      <div
        onClick={() => setOpen(o => !o)}
        style={{
          flex: 1, position: 'relative', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: mobile ? 280 : 340,
        }}
      >
        {/* Envelope */}
        <div style={{
          width: mobile ? 280 : 460,
          height: mobile ? 180 : 280,
          position: 'relative',
          transform: `rotate(${open ? -1 : -3}deg)`,
          transition: 'transform .4s',
        }}>
          {/* envelope body */}
          <div style={{
            position: 'absolute', inset: 0,
            background: paper,
            border: `1.6px solid ${ink}`,
            borderRadius: 4,
            boxShadow: open ? '0 8px 20px rgba(0,0,0,0.08)' : '0 2px 6px rgba(0,0,0,0.05)',
            transition: 'box-shadow .3s',
          }}></div>
          {/* envelope flap */}
          <svg viewBox="0 0 460 280" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            transformOrigin: 'top center',
            transform: open ? 'rotateX(180deg)' : 'rotateX(0)',
            transition: 'transform .6s cubic-bezier(.5,.1,.3,1.2)',
            pointerEvents: 'none',
          }}>
            <path d="M2 2 L230 150 L458 2 L458 4 L230 152 L2 4 Z"
                  fill={paperShade} stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M2 2 L230 150 L458 2"
                  fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round" />
            {/* wax seal */}
            <g transform="translate(230, 75)">
              <circle r="22" fill={accent} stroke={ink} strokeWidth="1.4" />
              <text textAnchor="middle" dy="6" fontFamily={titleFont} fontSize="22" fill={paper}>{day}</text>
            </g>
          </svg>
          {/* letter content */}
          <div style={{
            position: 'absolute', inset: '40px 30px 30px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity .4s .35s, transform .4s .35s',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft, letterSpacing: '0.15em' }}>
              DAY {day} HABIT
            </div>
            <div style={{
              fontFamily: titleFont, fontSize: mobile ? 38 : 56, lineHeight: 1.05,
              color: ink, margin: '8px 0 12px',
            }}>{habit}</div>
            <div style={{ fontFamily: handFont, fontSize: mobile ? 13 : 15, color: inkSoft, maxWidth: 320 }}>
              every morning · 30 seconds minimum · just do it
            </div>
          </div>
        </div>

        {!open && (
          <div style={{
            position: 'absolute', bottom: 8,
            fontFamily: handFont, fontSize: 13, color: inkSoft,
          }}>tap envelope to open ↑</div>
        )}
      </div>

      {open && (
        <button style={{
          background: ink, color: paper, border: 'none',
          padding: '10px 22px', borderRadius: 6,
          fontFamily: handFont, fontSize: 16, cursor: 'pointer',
          alignSelf: 'center', marginTop: 8,
        }}>Add to my list →</button>
      )}
    </Paper>
  );
};


// ============================================================
// REVEAL VARIANT C — "Polaroid develop"
// A blank card appears, then slowly "develops" the habit text
// over a few seconds (the slow reveal).
// ============================================================

const RevealPolaroid = ({ mobile = false }) => {
  const day = 9;
  const habit = 'Cold shower';
  const [progress, setProgress] = rvUseState(1); // 0..1
  const [running, setRunning] = rvUseState(false);

  rvUseEffect(() => {
    if (!running) return;
    if (progress >= 1) return;
    const id = setTimeout(() => setProgress(p => Math.min(1, p + 0.02)), 70);
    return () => clearTimeout(id);
  }, [progress, running]);

  const start = () => { setProgress(0); setRunning(true); };

  return (
    <Paper style={{ padding: mobile ? '18px 14px' : '28px 32px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: titleFont, fontSize: mobile ? 26 : 36, lineHeight: 1 }}>Day {day}</div>
        <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>let it develop…</div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: mobile ? 280 : 340,
      }}>
        <div style={{
          background: '#fbfaf3',
          border: `1.4px solid ${ink}`,
          padding: mobile ? '14px 14px 50px' : '20px 20px 70px',
          width: mobile ? 240 : 320,
          transform: 'rotate(-3deg)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}>
          {/* "photo" area */}
          <div style={{
            aspectRatio: '1',
            background: `linear-gradient(180deg, ${paperShade}, ${paper})`,
            border: `1px solid ${inkFaint}`,
            position: 'relative',
            overflow: 'hidden',
            filter: `brightness(${0.5 + progress * 0.5}) contrast(${0.4 + progress * 0.6})`,
            transition: 'filter .2s linear',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: progress,
              transition: 'opacity .2s linear',
            }}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft, marginBottom: 8 }}>
                  DAY {day}
                </div>
                <div style={{ fontFamily: titleFont, fontSize: mobile ? 36 : 48, lineHeight: 1, color: ink }}>
                  {habit}
                </div>
              </div>
            </div>
            {/* film grain overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `repeating-radial-gradient(circle, ${inkFaint} 0 1px, transparent 1px 3px)`,
              opacity: (1 - progress) * 0.4, mixBlendMode: 'multiply',
            }}></div>
          </div>
          <div style={{
            fontFamily: handFont, fontSize: mobile ? 13 : 16,
            textAlign: 'center', marginTop: 12, color: ink,
          }}>
            day {day} · {new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
        <button onClick={start} style={{
          background: 'transparent', border: `1.4px solid ${ink}`,
          padding: '8px 18px', borderRadius: 6,
          fontFamily: handFont, fontSize: 14, cursor: 'pointer', color: ink,
        }}>↻ replay reveal</button>
      </div>
    </Paper>
  );
};


// ============================================================
// REVEAL VARIANT D — "Stack flip"
// Habit list grows. When today arrives, new line types itself in
// among the existing list (in-context reveal — no modal).
// ============================================================

const RevealStack = ({ mobile = false }) => {
  const day = 9;
  const habits = [
    { d: 1, name: '10k steps' },
    { d: 2, name: 'Meditate 5m' },
    { d: 3, name: 'Cold shower' },
    { d: 4, name: 'Read 20 pgs' },
    { d: 5, name: 'No phone bed' },
    { d: 6, name: 'Stretch 10m' },
    { d: 7, name: 'Journal' },
    { d: 8, name: '2L water' },
    { d: 9, name: 'Run 1 mile' }, // today — animates
  ];
  const todayHabit = habits[day - 1].name;
  const [typed, setTyped] = rvUseState(todayHabit.length);
  const [running, setRunning] = rvUseState(false);

  rvUseEffect(() => {
    if (!running) return;
    if (typed >= todayHabit.length) return;
    const id = setTimeout(() => setTyped(t => t + 1), 80);
    return () => clearTimeout(id);
  }, [typed, running]);

  const start = () => { setTyped(0); setRunning(true); };

  return (
    <Paper style={{ padding: mobile ? '18px 14px' : '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: mobile ? 26 : 36, lineHeight: 1 }}>Your habits</div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>one new line each morning</div>
        </div>
        <button onClick={start} style={{
          background: 'transparent', border: `1.4px solid ${ink}`,
          padding: '6px 14px', borderRadius: 6,
          fontFamily: handFont, fontSize: 13, cursor: 'pointer',
        }}>↻ replay day {day}</button>
      </div>

      <div style={{
        background: paper,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${mobile ? 31 : 35}px, ${inkFaint} ${mobile ? 31 : 35}px, ${inkFaint} ${mobile ? 32 : 36}px)`,
        padding: '4px 0',
      }}>
        {habits.map((h, i) => {
          const isToday = h.d === day;
          const shownText = isToday ? todayHabit.slice(0, typed) : h.name;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: mobile ? 32 : 36,
              padding: '0 8px',
              borderLeft: isToday ? `3px solid ${accent}` : '3px solid transparent',
              opacity: isToday && typed === 0 ? 0.4 : 1,
            }}>
              <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft, width: 32 }}>day {h.d}</div>
              <Check state={isToday ? 'empty' : ((i + h.d) % 3 === 0 ? 'empty' : 'checked')} size={16} />
              <div style={{
                fontFamily: handFont, fontSize: mobile ? 15 : 18,
                color: isToday ? accent : ink,
                fontStyle: isToday ? 'italic' : 'normal',
              }}>
                {shownText}
                {isToday && typed < todayHabit.length && (
                  <span style={{ marginLeft: 2, opacity: 0.6, animation: 'blink 1s steps(2) infinite' }}>|</span>
                )}
              </div>
              {isToday && typed >= todayHabit.length && (
                <span style={{ marginLeft: 'auto', fontFamily: handFont, fontSize: 11, color: accent }}>
                  NEW today ✦
                </span>
              )}
            </div>
          );
        })}
        {Array.from({ length: 15 - day }).map((_, i) => (
          <div key={`fut-${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: mobile ? 32 : 36, padding: '0 8px', opacity: 0.35,
          }}>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft, width: 32 }}>day {day + i + 1}</div>
            <div style={{ width: 16, height: 16, border: `1px dashed ${inkFaint}`, borderRadius: 3 }}></div>
            <div style={{
              flex: 1, height: 2,
              background: `repeating-linear-gradient(90deg, ${inkFaint} 0 4px, transparent 4px 8px)`,
            }}></div>
            <div style={{ fontFamily: handFont, fontSize: 10, color: inkFaint }}>sealed</div>
          </div>
        ))}
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </Paper>
  );
};


Object.assign(window, {
  SetupScreen, RevealCalendar, RevealEnvelope, RevealPolaroid, RevealStack,
});
