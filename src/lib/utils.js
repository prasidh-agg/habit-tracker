// Parse a 'YYYY-MM-DD' string as a date at LOCAL midnight.
// (new Date('2026-06-15') parses as UTC midnight, which shifts the day in
// negative-offset timezones — the root of the disappearing-checkmark bug.)
export function parseLocalDate(dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDayNum(startDate) {
  const start = parseLocalDate(startDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // Math.round (not floor) keeps this correct across DST transitions, where
  // the millisecond gap between two local midnights isn't an exact day.
  return Math.round((now - start) / 86400000) + 1;
}

// Format a Date as 'YYYY-MM-DD' using LOCAL components (not UTC), so the
// check-in key always matches the calendar day the user actually sees.
export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayStr() {
  return formatDate(new Date());
}

export function addDays(dateStr, n) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + n);
  return d;
}

export function getStreak(habitId, userId, checkins, config) {
  const dayNum = getDayNum(config.startDate);
  const habit = config.habits.find(h => h.id === habitId);
  if (!habit) return 0;
  let streak = 0;
  for (let d = dayNum - 1; d >= habit.revealDay; d--) {
    const date = formatDate(addDays(config.startDate, d - 1));
    if (checkins[date]?.[userId]?.[habitId]?.done) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getCompletionHistory(userId, checkins, config, days) {
  const dayNum = getDayNum(config.startDate);
  const result = [];
  for (let d = 1; d < Math.min(dayNum, days + 1); d++) {
    const date = formatDate(addDays(config.startDate, d - 1));
    const activeHabits = config.habits.filter(h => h.revealDay <= d);
    if (activeHabits.length === 0) { result.push(0); continue; }
    const done = activeHabits.filter(h => checkins[date]?.[userId]?.[h.id]?.done).length;
    result.push(Math.round((done / activeHabits.length) * 100));
  }
  return result;
}

export function getTotalScore(userId, checkins, config) {
  const dayNum = getDayNum(config.startDate);
  let total = 0;
  for (let d = 1; d < dayNum; d++) {
    const date = formatDate(addDays(config.startDate, d - 1));
    const activeHabits = config.habits.filter(h => h.revealDay <= d);
    total += activeHabits.filter(h => checkins[date]?.[userId]?.[h.id]?.done).length;
  }
  return total;
}

export function getOverallCompletion(userId, checkins, config) {
  const dayNum = getDayNum(config.startDate);
  let total = 0;
  let possible = 0;
  for (let d = 1; d < dayNum; d++) {
    const date = formatDate(addDays(config.startDate, d - 1));
    const activeHabits = config.habits.filter(h => h.revealDay <= d);
    possible += activeHabits.length;
    total += activeHabits.filter(h => checkins[date]?.[userId]?.[h.id]?.done).length;
  }
  if (possible === 0) return 0;
  return Math.round((total / possible) * 100);
}

export async function hashPin(pin) {
  const data = new TextEncoder().encode(String(pin));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function timeAgo(ts) {
  if (!ts) return 'never';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}
