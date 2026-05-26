import { useState } from 'react';
import { hashPin } from '../lib/utils.js';
import { bg, paper, ink, inkSoft, inkFaint, accent, accentSoft, handFont, titleFont, monoFont } from '../constants.js';
import { Paper, SketchBox, Avatar } from './primitives.jsx';

export default function PinGate({ config, onAuth, isMobile }) {
  const [selected, setSelected] = useState(null); // 'prasidh' | 'anisha'
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleUserSelect = (uid) => {
    setSelected(uid);
    setPin('');
    setError('');
  };

  const handlePinChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    setError('');
    if (digits.length === 4) {
      verifyPin(digits);
    }
  };

  const verifyPin = async (p) => {
    if (!config || !selected) return;
    setChecking(true);
    try {
      const hashed = await hashPin(p);
      const stored = config.users[selected]?.pinHash;
      if (hashed === stored) {
        onAuth(selected);
      } else {
        setError("That's not the right PIN");
        setPin('');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const users = config?.users || {};
  const userList = [
    { id: 'prasidh', ...users.prasidh },
    { id: 'anisha',  ...users.anisha  },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <Paper style={{
        width: '100%', maxWidth: 440, height: 'auto',
        borderRadius: 12, padding: isMobile ? '32px 20px' : '40px 40px',
        boxShadow: '0 4px 24px rgba(31,26,20,0.08)',
      }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: titleFont, fontSize: 40, color: ink, marginBottom: 4 }}>
            30·days
          </div>
          <div style={{ fontFamily: handFont, fontSize: 15, color: inkSoft }}>
            Who are you?
          </div>
        </div>

        {/* User selection */}
        {!selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {userList.map(u => (
              <button
                key={u.id}
                onClick={() => handleUserSelect(u.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px',
                  background: 'transparent',
                  border: `1.5px solid ${inkFaint}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontFamily: handFont,
                  fontSize: 20,
                  color: ink,
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = ink;
                  e.currentTarget.style.background = 'rgba(31,26,20,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = inkFaint;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Avatar
                  letter={u.initial || u.name?.[0] || '?'}
                  color={u.id === 'prasidh' ? ink : accent}
                  size={40}
                />
                <div>
                  <div style={{ fontFamily: titleFont, fontSize: 22 }}>I'm {u.name}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PIN entry */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Avatar
                letter={users[selected]?.initial || '?'}
                color={selected === 'prasidh' ? ink : accent}
                size={36}
              />
              <span style={{ fontFamily: titleFont, fontSize: 24, color: ink }}>
                {users[selected]?.name}
              </span>
            </div>

            <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft }}>
              Enter your 4-digit PIN
            </div>

            {/* PIN dots display */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 4 }}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: i < pin.length ? ink : 'transparent',
                    border: `2px solid ${i < pin.length ? ink : inkFaint}`,
                    transition: 'all 0.1s',
                  }}
                />
              ))}
            </div>

            {/* Hidden PIN input */}
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => handlePinChange(e.target.value)}
              autoFocus
              disabled={checking}
              style={{
                position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: checking ? 'none' : 'auto',
              }}
            />

            {/* Numpad for mobile */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10, width: '100%', maxWidth: 240,
            }}>
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === '⌫') {
                      handlePinChange(pin.slice(0, -1));
                    } else if (k !== '') {
                      handlePinChange(pin + String(k));
                    }
                  }}
                  disabled={checking || k === ''}
                  style={{
                    height: 52,
                    background: k === '' ? 'transparent' : 'rgba(31,26,20,0.06)',
                    border: k === '' ? 'none' : `1px solid ${inkFaint}`,
                    borderRadius: 8,
                    fontFamily: k === '⌫' ? 'inherit' : monoFont,
                    fontSize: k === '⌫' ? 20 : 22,
                    color: ink,
                    cursor: k === '' ? 'default' : 'pointer',
                    opacity: k === '' ? 0 : 1,
                    transition: 'all 0.1s',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {error && (
              <div style={{
                fontFamily: handFont, fontSize: 15, color: '#b33',
                padding: '8px 16px', background: '#fff0f0',
                borderRadius: 6, textAlign: 'center',
                animation: 'fade-in 0.2s ease',
              }}>
                {error}
              </div>
            )}

            <button
              onClick={() => { setSelected(null); setPin(''); setError(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: handFont, fontSize: 14, color: inkSoft,
                padding: '4px 8px',
              }}
            >
              ← Change user
            </button>
          </div>
        )}

      </Paper>
    </div>
  );
}
