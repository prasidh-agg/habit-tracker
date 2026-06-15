import { getStore } from '@netlify/blobs';
import { createHash } from 'crypto';

const KEY = 'app-data';

function hashPin(pin) {
  return createHash('sha256').update(String(pin)).digest('hex');
}

export default async function handler(req, context) {
  const store = getStore('habit-tracker');

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method === 'GET') {
    try {
      const data = await store.get(KEY, { type: 'json' }).catch(() => null);
      return Response.json(data, { headers });
    } catch (err) {
      return Response.json(null, { headers });
    }
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400, headers });
    }

    const { action } = body;
    let current;
    try {
      current = await store.get(KEY, { type: 'json' }).catch(() => null) || { config: null, checkins: {} };
    } catch {
      current = { config: null, checkins: {} };
    }

    if (action === 'setup') {
      if (current.config) {
        return Response.json({ error: 'Already set up' }, { status: 400, headers });
      }
      const { config } = body.payload;
      // Hash PINs server-side
      const users = {};
      for (const [uid, u] of Object.entries(config.users)) {
        users[uid] = { name: u.name, initial: u.initial, pinHash: hashPin(u.pin) };
      }
      const newData = { config: { ...config, users }, checkins: {} };
      await store.set(KEY, JSON.stringify(newData));
      return Response.json({ success: true }, { headers });
    }

    if (action === 'checkin') {
      const { userId, date, habitId, done, value } = body;
      if (!current.config) {
        return Response.json({ error: 'No config' }, { status: 400, headers });
      }
      const checkins = current.checkins || {};
      if (!checkins[date]) checkins[date] = {};
      if (!checkins[date][userId]) checkins[date][userId] = {};
      checkins[date][userId][habitId] = { done };
      if (value !== undefined) checkins[date][userId][habitId].value = value;
      await store.set(KEY, JSON.stringify({ ...current, checkins }));
      return Response.json({ success: true }, { headers });
    }

    if (action === 'reconfigure') {
      // Restart the challenge: preserve existing users (and their hashed
      // PINs), replace the habit schedule + dates, and wipe all check-ins.
      if (!current.config) {
        return Response.json({ error: 'Nothing to reconfigure' }, { status: 400, headers });
      }
      const { config } = body.payload;
      const newData = {
        config: {
          ...current.config,
          startDate: config.startDate,
          rampDays: config.rampDays,
          practiceDays: config.practiceDays,
          habits: config.habits,
        },
        checkins: {},
      };
      await store.set(KEY, JSON.stringify(newData));
      return Response.json({ success: true }, { headers });
    }

    if (action === 'reset') {
      // Dev-only reset
      await store.set(KEY, JSON.stringify({ config: null, checkins: {} }));
      return Response.json({ success: true }, { headers });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400, headers });
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
}

export const config = { path: '/api/data' };
