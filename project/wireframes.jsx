// Four wireframe approaches for the 30-day habit/challenge tracker.
// Warm notebook aesthetic — sketchy, hand-drawn, low-fi.
// Each variation has a desktop and a mobile version.

// ---------- Shared sketchy primitives ----------

const ink = '#1f1a14';
const inkSoft = 'rgba(31,26,20,0.55)';
const inkFaint = 'rgba(31,26,20,0.3)';
const paper = '#f6f0e0';
const paperShade = '#ece4ce';
const accent = 'oklch(0.62 0.13 45)'; // terracotta
const accentSoft = 'oklch(0.85 0.06 45)';

const handFont = '"Patrick Hand", "Caveat", "Comic Sans MS", cursive';
const titleFont = '"Caveat", "Patrick Hand", cursive';
const monoFont = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

// Hand-drawn checkbox SVG (empty / checked / numeric)
const Check = ({ state = 'empty', size = 18 }) => {
  const stroke = ink;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
      <path
        d="M2.5 3 Q2 3.5 2.2 17.5 Q2.8 18 17.5 17.6 Q18 17 17.7 2.6 Q17 2 2.5 3 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {state === 'checked' && (
        <path
          d="M4 10 Q7 13 9 14 Q12 9 16 4"
          fill="none"
          stroke={accent}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {state === 'miss' && (
        <g stroke={inkSoft} strokeWidth="1.6" strokeLinecap="round">
          <line x1="5" y1="5" x2="15" y2="15" />
          <line x1="15" y1="5" x2="5" y2="15" />
        </g>
      )}
    </svg>
  );
};

// Dashed placeholder line — like "____________"
const ScribbleLine = ({ width = '100%', dashed = false, opacity = 0.6 }) => (
  <svg width={width} height="3" viewBox="0 0 200 3" preserveAspectRatio="none"
       style={{ display: 'block', opacity }}>
    <path
      d="M1 1.5 Q40 0.5 80 1.8 Q120 2.5 160 1.2 Q180 0.8 199 1.5"
      fill="none" stroke={ink} strokeWidth="1.2"
      strokeLinecap="round"
      strokeDasharray={dashed ? '4 3' : 'none'}
    />
  </svg>
);

// Sketchy rectangle (slightly wonky)
const SketchBox = ({ children, style, dashed = false, fill = 'transparent' }) => (
  <div style={{
    position: 'relative',
    padding: '12px 14px',
    background: fill,
    ...style,
  }}>
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
         preserveAspectRatio="none" viewBox="0 0 100 100">
      <path
        d="M0.6 1.2 Q50 0.3 99.4 1 Q99.2 50 99.6 99 Q50 99.5 0.4 98.8 Q0.8 50 0.6 1.2 Z"
        fill="none" stroke={ink} strokeWidth="0.3" vectorEffect="non-scaling-stroke"
        strokeDasharray={dashed ? '4 3' : 'none'}
        style={{ strokeWidth: '1.4px' }}
      />
    </svg>
    <div style={{ position: 'relative' }}>{children}</div>
  </div>
);

// Tiny circle bullet (filled vs empty)
const Dot = ({ filled = false, miss = false, size = 12, today = false }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" style={{ flexShrink: 0 }}>
    <circle
      cx="6" cy="6" r="4.5"
      fill={filled ? accent : (miss ? 'transparent' : 'transparent')}
      stroke={today ? ink : (miss ? inkFaint : inkSoft)}
      strokeWidth={today ? 1.6 : 1}
      strokeDasharray={miss ? '1.5 1.5' : 'none'}
    />
    {miss && <line x1="3" y1="6" x2="9" y2="6" stroke={inkFaint} strokeWidth="1" />}
  </svg>
);

// Hand-drawn avatar circle with initial
const Avatar = ({ letter, color = ink, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    border: `1.5px solid ${color}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: titleFont, fontSize: size * 0.55, color,
    background: paper,
    transform: 'rotate(-2deg)',
  }}>{letter}</div>
);

// Section caption (small handwritten label above a block)
const Caption = ({ children, style }) => (
  <div style={{
    fontFamily: handFont, fontSize: 13, color: inkSoft,
    letterSpacing: '0.04em', textTransform: 'uppercase',
    marginBottom: 6, ...style,
  }}>{children}</div>
);

// Wireframe artboard frame: paper texture + slight padding
const Paper = ({ children, style }) => (
  <div style={{
    width: '100%', height: '100%',
    background: paper,
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(31,26,20,0.04) 27px, rgba(31,26,20,0.04) 28px),
      radial-gradient(ellipse at top left, rgba(255,255,255,0.4), transparent 60%)
    `,
    color: ink,
    fontFamily: handFont,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  }}>{children}</div>
);


// ============================================================
// VARIATION 1 — "The Notebook Spread"
// Two-page paper feel. Your page left, friend's page right.
// Top: ramp timeline (Day 1 → 30). Bottom: today's habits side-by-side.
// ============================================================

const NotebookSpread = ({ mobile = false }) => {
  const habits = [
    { name: '10k steps', type: 'num', done: 7200, target: 10000, mineDone: false, friendDone: true },
    { name: '5 min meditate', type: 'check', mineDone: true, friendDone: true },
    { name: 'Read 20 pages', type: 'num', done: 12, target: 20, mineDone: false, friendDone: false },
    { name: 'No phone in bed', type: 'check', mineDone: true, friendDone: false },
    { name: 'Cold shower', type: 'check', mineDone: false, friendDone: true },
  ];
  const day = 9;

  if (mobile) {
    return (
      <Paper style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: titleFont, fontSize: 30, lineHeight: 1, color: ink }}>Day {day}</div>
            <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft, marginTop: 2 }}>of 30 · adding phase</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Avatar letter="A" />
            <Avatar letter="J" color={accent} />
          </div>
        </div>

        {/* mini ramp */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 18,
              borderBottom: `1.4px solid ${i < day ? ink : inkFaint}`,
              background: i + 1 === day ? accentSoft : 'transparent',
              fontFamily: monoFont, fontSize: 8,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              color: i + 1 === day ? ink : 'transparent',
            }}>{i + 1}</div>
          ))}
        </div>

        <Caption>Today's habits</Caption>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {habits.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check state={h.mineDone ? 'checked' : 'empty'} />
              <div style={{ flex: 1, fontFamily: handFont, fontSize: 17 }}>
                {h.name}
                {h.type === 'num' && (
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft, marginLeft: 6 }}>
                    {h.done}/{h.target}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: handFont, fontSize: 11, color: inkSoft }}>
                <span>J</span>
                <Check state={h.friendDone ? 'checked' : 'empty'} size={14} />
              </div>
            </div>
          ))}
          <button style={{
            border: `1.4px dashed ${inkSoft}`, background: 'transparent',
            padding: '10px', borderRadius: 6, fontFamily: handFont, fontSize: 15,
            color: inkSoft, marginTop: 4, cursor: 'pointer',
          }}>+ add habit ({15 - habits.length} left)</button>
        </div>
      </Paper>
    );
  }

  return (
    <Paper style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column' }}>
      {/* Top — header + ramp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: 44, lineHeight: 0.9, color: ink }}>Day {day}</div>
          <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft, marginTop: 4 }}>
            of 30 · adding phase (days 1–15)
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: titleFont, fontSize: 22, color: ink }}>30 days w/ Jordan</div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft, marginTop: 2 }}>started May 17 · ends Jun 16</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Caption>The ramp</Caption>
        <div style={{ display: 'flex', gap: 3, height: 36 }}>
          {Array.from({ length: 30 }).map((_, i) => {
            const isAdd = i < 15;
            const isPast = i + 1 < day;
            const isToday = i + 1 === day;
            return (
              <div key={i} style={{
                flex: 1,
                background: isToday ? accentSoft : 'transparent',
                borderBottom: `1.4px solid ${isPast || isToday ? ink : inkFaint}`,
                borderRight: i === 14 ? `2px dashed ${inkSoft}` : 'none',
                fontFamily: monoFont, fontSize: 9,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3,
                color: isPast || isToday ? ink : inkFaint,
              }}>{i + 1}</div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: handFont, fontSize: 11, color: inkSoft }}>
          <span>← add a habit each day</span>
          <span>practice all habits →</span>
        </div>
      </div>

      {/* Two-page spread */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0 }}>
        {/* Mine */}
        <div style={{ paddingRight: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Avatar letter="A" />
            <div style={{ fontFamily: titleFont, fontSize: 24 }}>You</div>
            <div style={{ marginLeft: 'auto', fontFamily: monoFont, fontSize: 11, color: inkSoft }}>3/5 today</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {habits.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Check state={h.mineDone ? 'checked' : 'empty'} />
                <div style={{ flex: 1, fontFamily: handFont, fontSize: 18 }}>{h.name}</div>
                {h.type === 'num' && (
                  <span style={{ fontFamily: monoFont, fontSize: 11, color: inkSoft }}>{h.done}/{h.target}</span>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.6 }}>
              <Check state="empty" />
              <div style={{ flex: 1, fontFamily: handFont, fontSize: 18, color: inkSoft, fontStyle: 'italic' }}>+ add a new habit today</div>
            </div>
          </div>
        </div>
        {/* Binding */}
        <div style={{ borderLeft: `1px dashed ${inkSoft}` }}></div>
        {/* Friend */}
        <div style={{ paddingLeft: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Avatar letter="J" color={accent} />
            <div style={{ fontFamily: titleFont, fontSize: 24, color: accent }}>Jordan</div>
            <div style={{ marginLeft: 'auto', fontFamily: monoFont, fontSize: 11, color: inkSoft }}>4/5 today</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {habits.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.85 }}>
                <Check state={h.friendDone ? 'checked' : 'empty'} />
                <div style={{ flex: 1, fontFamily: handFont, fontSize: 18 }}>{h.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
};


// ============================================================
// VARIATION 2 — "Grid Map" (calendar matrix)
// Big matrix: rows = habits, cols = day 1..30. Cells = state.
// Your matrix above, Jordan's below. Streak # at end of row.
// ============================================================

const GridMap = ({ mobile = false }) => {
  const habits = [
    { name: '10k steps', addedDay: 1, streak: 7 },
    { name: 'Meditate 5m', addedDay: 2, streak: 8 },
    { name: 'Read 20 pgs', addedDay: 4, streak: 3 },
    { name: 'No phone bed', addedDay: 5, streak: 5 },
    { name: 'Cold shower', addedDay: 7, streak: 1 },
    { name: 'Stretch', addedDay: 9, streak: 1 },
  ];
  const day = 9;
  const totalDays = mobile ? 15 : 30;

  const cellFor = (h, d, who = 'mine') => {
    if (d < h.addedDay) return null; // before added
    if (d > day) return 'future';
    // fake some misses
    const seed = (h.name.length + d + (who === 'friend' ? 3 : 0)) % 7;
    if (seed === 0) return 'miss';
    return 'done';
  };

  const Matrix = ({ who, color }) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Avatar letter={who[0]} color={color} size={mobile ? 24 : 28} />
        <div style={{ fontFamily: titleFont, fontSize: mobile ? 18 : 22, color }}>{who}</div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${mobile ? 88 : 110}px repeat(${totalDays}, 1fr) ${mobile ? 32 : 40}px`,
        rowGap: 4, columnGap: 2, alignItems: 'center',
      }}>
        {/* header row */}
        <div></div>
        {Array.from({ length: totalDays }).map((_, i) => (
          <div key={i} style={{
            fontFamily: monoFont, fontSize: mobile ? 7 : 9, textAlign: 'center',
            color: i + 1 === day ? ink : inkFaint,
            fontWeight: i + 1 === day ? 700 : 400,
          }}>{i + 1}</div>
        ))}
        <div style={{ fontFamily: handFont, fontSize: mobile ? 9 : 10, color: inkSoft, textAlign: 'center' }}>🔥</div>

        {habits.map((h, hi) => (
          <React.Fragment key={hi}>
            <div style={{ fontFamily: handFont, fontSize: mobile ? 12 : 14, color: ink, paddingRight: 4 }}>{h.name}</div>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = i + 1;
              const c = cellFor(h, d, who.toLowerCase());
              return (
                <div key={i} style={{
                  aspectRatio: '1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: c === null ? `repeating-linear-gradient(45deg, transparent, transparent 2px, ${inkFaint} 2px, ${inkFaint} 3px)` : 'transparent',
                  border: c === 'future' ? 'none' : `1px solid ${c === null ? 'transparent' : inkSoft}`,
                  borderRadius: 3,
                  opacity: c === null ? 0.3 : 1,
                  position: 'relative',
                }}>
                  {c === 'done' && <div style={{
                    width: '70%', height: '70%', background: color, borderRadius: 2,
                    transform: `rotate(${(hi + i) % 4 - 2}deg)`,
                  }}></div>}
                  {c === 'miss' && <div style={{ fontFamily: monoFont, fontSize: mobile ? 8 : 10, color: inkSoft }}>×</div>}
                </div>
              );
            })}
            <div style={{
              fontFamily: monoFont, fontSize: mobile ? 11 : 13,
              color: ink, textAlign: 'center', fontWeight: 600,
            }}>{h.streak}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <Paper style={{ padding: mobile ? '16px 14px' : '26px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: mobile ? 14 : 22 }}>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: mobile ? 26 : 36, whiteSpace: 'nowrap' }}>The grid</div>
          <div style={{ fontFamily: handFont, fontSize: mobile ? 11 : 13, color: inkSoft }}>
            day {day}/30 · {mobile ? 'first 15 days shown' : ''}
          </div>
        </div>
        <button style={{
          background: 'transparent', border: `1.4px solid ${ink}`,
          borderRadius: 999, padding: mobile ? '5px 10px' : '7px 14px',
          fontFamily: handFont, fontSize: mobile ? 12 : 14, cursor: 'pointer',
        }}>+ habit</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 26 }}>
        <Matrix who="You" color={ink} />
        <div style={{ borderTop: `1px dashed ${inkSoft}` }}></div>
        <Matrix who="Jordan" color={accent} />
      </div>

      {!mobile && (
        <div style={{
          marginTop: 20, display: 'flex', gap: 18, fontFamily: handFont, fontSize: 12, color: inkSoft,
        }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: ink, marginRight: 4, verticalAlign: 'middle' }}></span>done</span>
          <span>× missed</span>
          <span style={{ opacity: 0.5 }}>▦ not yet added</span>
          <span style={{ marginLeft: 'auto', fontFamily: monoFont }}>your total: 38 · jordan: 41</span>
        </div>
      )}
    </Paper>
  );
};


// ============================================================
// VARIATION 3 — "Streak Stack"
// Vertical cards, one per habit. Each shows sparkline-of-dots,
// streak, your vs friend's. Stats banner at top.
// ============================================================

const StreakStack = ({ mobile = false }) => {
  const habits = [
    { name: '10k steps', addedDay: 1, streak: 7, friendStreak: 9, dots: 'YYYNYYYNN' },
    { name: 'Meditate', addedDay: 2, streak: 8, friendStreak: 6, dots: 'YYYYYYYY' },
    { name: 'Read 20 pgs', addedDay: 4, streak: 3, friendStreak: 5, dots: 'YYNYNYY' },
    { name: 'No phone bed', addedDay: 5, streak: 5, friendStreak: 2, dots: 'YYYYYY' },
    { name: 'Cold shower', addedDay: 7, streak: 1, friendStreak: 3, dots: 'NNNYY' },
  ];
  const day = 9;

  const Card = ({ h }) => (
    <SketchBox style={{ padding: mobile ? '12px 14px' : '14px 18px', background: paper }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Check state="empty" size={20} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: handFont, fontSize: mobile ? 16 : 19, color: ink }}>{h.name}</div>
          <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>added day {h.addedDay}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: titleFont, fontSize: mobile ? 22 : 26, color: ink, lineHeight: 1 }}>{h.streak}🔥</div>
          <div style={{ fontFamily: handFont, fontSize: 11, color: accent }}>jordan: {h.friendStreak}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontFamily: monoFont, fontSize: 9, color: inkSoft, width: 38 }}>you →</span>
        {h.dots.split('').map((c, i) => (
          <Dot key={i} filled={c === 'Y'} miss={c === 'N'} today={i === h.dots.length - 1} size={mobile ? 10 : 12} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontFamily: monoFont, fontSize: 9, color: accent, width: 38 }}>jordan →</span>
        {h.dots.split('').map((c, i) => {
          const flip = (i + h.name.length) % 5 === 0 ? (c === 'Y' ? 'N' : 'Y') : c;
          return <Dot key={i} filled={flip === 'Y'} miss={flip === 'N'} today={i === h.dots.length - 1} size={mobile ? 10 : 12} />;
        })}
      </div>
    </SketchBox>
  );

  return (
    <Paper style={{ padding: mobile ? '16px 14px' : '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: titleFont, fontSize: mobile ? 30 : 42, lineHeight: 0.9 }}>Streaks</div>
          <div style={{ fontFamily: handFont, fontSize: 12, color: inkSoft }}>day {day}/30 · w/ jordan</div>
        </div>
        <div style={{ display: 'flex', gap: mobile ? 10 : 18, alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: titleFont, fontSize: mobile ? 24 : 32, color: ink, lineHeight: 1 }}>78%</div>
            <div style={{ fontFamily: handFont, fontSize: 10, color: inkSoft }}>you</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: titleFont, fontSize: mobile ? 24 : 32, color: accent, lineHeight: 1 }}>82%</div>
            <div style={{ fontFamily: handFont, fontSize: 10, color: inkSoft }}>jordan</div>
          </div>
        </div>
      </div>

      {/* mini ramp */}
      <div style={{ display: 'flex', gap: 2, height: 16, marginBottom: 16 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, background: i < day ? ink : 'transparent',
            border: `1px solid ${i < day ? ink : inkFaint}`,
            borderRadius: 2, height: i + 1 === day ? '110%' : (i < day ? '80%' : '40%'),
            alignSelf: 'flex-end',
          }}></div>
        ))}
      </div>

      <Caption>Habits ({habits.length}/15)</Caption>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {habits.slice(0, mobile ? 3 : 5).map((h, i) => <Card key={i} h={h} />)}
        <button style={{
          border: `1.4px dashed ${inkSoft}`, background: 'transparent',
          padding: mobile ? '10px' : '14px', borderRadius: 6,
          fontFamily: handFont, fontSize: mobile ? 14 : 16, color: inkSoft, cursor: 'pointer',
        }}>+ add habit #{habits.length + 1}</button>
      </div>
    </Paper>
  );
};


// ============================================================
// VARIATION 4 — "Race Track"
// Stat-heavy dashboard: today checklist + cumulative charts +
// head-to-head leaderboard feel.
// ============================================================

const RaceTrack = ({ mobile = false }) => {
  const habits = [
    { name: '10k steps', mine: true, friend: true },
    { name: '5 min meditate', mine: true, friend: false },
    { name: 'Read 20 pgs', mine: false, friend: true },
    { name: 'No phone bed', mine: true, friend: true },
    { name: 'Cold shower', mine: false, friend: false },
  ];
  const day = 9;
  const myCompletion = [40, 60, 80, 100, 75, 80, 90, 80, 60];
  const fCompletion = [60, 80, 80, 60, 80, 90, 70, 90, 80];

  const Sparkline = ({ data, color, height = 50, dashed = false }) => {
    const max = 100;
    const w = 100, h = height;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8"
                  strokeDasharray={dashed ? '3 2' : 'none'}
                  vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - (v / max) * h}
                  r="1.4" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    );
  };

  if (mobile) {
    return (
      <Paper style={{ padding: '16px 14px' }}>
        <div style={{ fontFamily: titleFont, fontSize: 28 }}>You vs Jordan</div>
        <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft, marginBottom: 12 }}>day {day}/30</div>

        {/* score */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <SketchBox style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
            <div style={{ fontFamily: handFont, fontSize: 10, color: inkSoft }}>YOU</div>
            <div style={{ fontFamily: titleFont, fontSize: 28, lineHeight: 1 }}>38</div>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft }}>checks done</div>
          </SketchBox>
          <SketchBox style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
            <div style={{ fontFamily: handFont, fontSize: 10, color: accent }}>JORDAN</div>
            <div style={{ fontFamily: titleFont, fontSize: 28, lineHeight: 1, color: accent }}>41</div>
            <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft }}>checks done</div>
          </SketchBox>
        </div>

        <Caption>Today</Caption>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {habits.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Check state={h.mine ? 'checked' : 'empty'} />
              <div style={{ flex: 1, fontFamily: handFont, fontSize: 15 }}>{h.name}</div>
              <Check state={h.friend ? 'checked' : 'empty'} size={14} />
            </div>
          ))}
        </div>

        <Caption>Completion trend</Caption>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <Sparkline data={myCompletion} color={ink} height={60} />
          <div style={{ position: 'absolute', inset: 0 }}>
            <Sparkline data={fCompletion} color={accent} height={60} dashed />
          </div>
        </div>
      </Paper>
    );
  }

  return (
    <Paper style={{ padding: '26px 30px', display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 18 }}>
      {/* Header score row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: titleFont, fontSize: 38, lineHeight: 1 }}>You vs Jordan</div>
          <div style={{ fontFamily: handFont, fontSize: 13, color: inkSoft }}>day {day} of 30 — adding phase</div>
        </div>
        <SketchBox style={{ padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontFamily: handFont, fontSize: 11, color: inkSoft }}>YOU</div>
          <div style={{ fontFamily: titleFont, fontSize: 38, lineHeight: 1 }}>38</div>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft }}>78% rate</div>
        </SketchBox>
        <div style={{ fontFamily: titleFont, fontSize: 32, color: inkSoft }}>vs</div>
        <SketchBox style={{ padding: '10px 18px', textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontFamily: handFont, fontSize: 11, color: accent }}>JORDAN</div>
          <div style={{ fontFamily: titleFont, fontSize: 38, lineHeight: 1, color: accent }}>41</div>
          <div style={{ fontFamily: monoFont, fontSize: 10, color: inkSoft }}>82% rate</div>
        </SketchBox>
      </div>

      {/* Race chart */}
      <SketchBox style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Caption style={{ margin: 0 }}>Daily completion rate</Caption>
          <div style={{ display: 'flex', gap: 12, fontFamily: handFont, fontSize: 11, color: inkSoft }}>
            <span>— you</span>
            <span style={{ color: accent }}>– – jordan</span>
          </div>
        </div>
        <div style={{ position: 'relative', height: 90 }}>
          <Sparkline data={myCompletion} color={ink} height={90} />
          <div style={{ position: 'absolute', inset: 0 }}>
            <Sparkline data={fCompletion} color={accent} height={90} dashed />
          </div>
          {/* x-axis */}
          <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontFamily: monoFont, fontSize: 9, color: inkSoft }}>
            <span>d1</span><span>d3</span><span>d5</span><span>d7</span><span>d9</span>
          </div>
        </div>
      </SketchBox>

      {/* Two-column today */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <SketchBox style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Avatar letter="A" size={26} />
            <div style={{ fontFamily: titleFont, fontSize: 22 }}>Your checklist</div>
            <div style={{ marginLeft: 'auto', fontFamily: monoFont, fontSize: 11, color: inkSoft }}>3/5</div>
          </div>
          {habits.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <Check state={h.mine ? 'checked' : 'empty'} />
              <div style={{ fontFamily: handFont, fontSize: 16 }}>{h.name}</div>
            </div>
          ))}
        </SketchBox>
        <SketchBox style={{ padding: '14px 18px', opacity: 0.92 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Avatar letter="J" color={accent} size={26} />
            <div style={{ fontFamily: titleFont, fontSize: 22, color: accent }}>Jordan's checklist</div>
            <div style={{ marginLeft: 'auto', fontFamily: monoFont, fontSize: 11, color: inkSoft }}>3/5</div>
          </div>
          {habits.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <Check state={h.friend ? 'checked' : 'empty'} />
              <div style={{ fontFamily: handFont, fontSize: 16 }}>{h.name}</div>
            </div>
          ))}
        </SketchBox>
      </div>
    </Paper>
  );
};


// Expose for the canvas script
Object.assign(window, {
  NotebookSpread, GridMap, StreakStack, RaceTrack,
  Paper, SketchBox, Caption, Check, Dot, Avatar, ScribbleLine,
  ink, inkSoft, inkFaint, paper, accent, accentSoft,
  handFont, titleFont, monoFont,
});
