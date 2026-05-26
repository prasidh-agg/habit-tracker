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

export async function saveCheckin(userId, date, habitId, done, value) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'checkin', userId, date, habitId, done, value }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
