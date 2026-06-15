const BASE = '/api/data';

export async function getData() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to load data');
  return res.json();
}

export async function setupChallenge(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'setup', payload }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Restart the challenge: keeps the existing users/PINs but replaces the
// habit schedule + dates and wipes all check-ins.
export async function reconfigureChallenge(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reconfigure', payload }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Edit the habit schedule (names, reveal days, dates) WITHOUT touching any
// existing check-ins.
export async function editConfig(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'edit-config', payload }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveCheckin(userId, date, habitId, done, value) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkin', userId, date, habitId, done, value }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
