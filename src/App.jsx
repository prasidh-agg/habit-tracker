import { useState, useEffect, useCallback, useRef } from 'react';
import { getData, saveCheckin } from './lib/api.js';
import { getDayNum, todayStr, hashPin } from './lib/utils.js';
import { bg, paper, ink, inkSoft, accent, handFont, titleFont } from './constants.js';
import SetupScreen from './components/SetupScreen.jsx';
import PinGate from './components/PinGate.jsx';
import RevealCalendar from './components/RevealCalendar.jsx';
import TabbedApp from './components/TabbedApp.jsx';

const AUTH_KEY = 'habit-auth';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function App() {
  const [state, setState] = useState('loading'); // loading | setup | auth | reveal | app
  const [appData, setAppData] = useState(null); // { config, checkins }
  const [userId, setUserId] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const isMobile = useIsMobile();

  const loadData = useCallback(async (silent = false) => {
    try {
      const data = await getData();
      setAppData(data);
      setLastSync(Date.now());
      return data;
    } catch (err) {
      if (!silent) setError('Failed to load data. Please refresh.');
      return null;
    }
  }, []);

  const determineState = useCallback((data, uid) => {
    if (!data || !data.config) {
      setState('setup');
      return;
    }

    if (!uid) {
      setState('auth');
      return;
    }

    const dayNum = getDayNum(data.config.startDate);
    const totalDays = (data.config.rampDays || 15) + (data.config.practiceDays || 15);

    if (dayNum < 1) {
      setState('app'); // shows "starts in N days"
      return;
    }

    if (dayNum > totalDays) {
      setState('app'); // shows celebration
      return;
    }

    // Check if in ramp phase and today's habit not yet revealed
    if (dayNum <= (data.config.rampDays || 15)) {
      const revealKey = `habit-revealed-${uid}`;
      const lastRevealed = parseInt(localStorage.getItem(revealKey) || '0', 10);
      if (lastRevealed < dayNum) {
        setState('reveal');
        return;
      }
    }

    setState('app');
  }, []);

  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      const stored = localStorage.getItem(AUTH_KEY);
      let uid = null;
      if (stored) {
        try {
          uid = JSON.parse(stored).userId;
          setUserId(uid);
        } catch {
          localStorage.removeItem(AUTH_KEY);
        }
      }
      determineState(data, uid);
    };
    init();
  }, [loadData, determineState]);

  // Poll every 30s when in app state
  useEffect(() => {
    if (state === 'app') {
      pollRef.current = setInterval(() => {
        loadData(true).then(data => {
          if (data) setAppData(data);
        });
      }, 30000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [state, loadData]);

  const handleSetupComplete = useCallback(async (data) => {
    const freshData = await loadData();
    setAppData(freshData || data);
    setState('auth');
  }, [loadData]);

  const handleAuth = useCallback((uid) => {
    setUserId(uid);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ userId: uid }));
    determineState(appData, uid);
  }, [appData, determineState]);

  const handleRevealDone = useCallback(() => {
    setState('app');
  }, []);

  const handleLogout = useCallback(() => {
    setUserId(null);
    localStorage.removeItem(AUTH_KEY);
    setState('auth');
  }, []);

  const mutate = useCallback(async (optimisticData, habitId, done, value, date) => {
    setAppData(optimisticData);
    const target = date || todayStr();
    try {
      await saveCheckin(userId, target, habitId, done, value);
    } catch (err) {
      // silently fail, data will sync on next poll
    }
  }, [userId]);

  const handleRestart = useCallback(() => {
    setState('restart');
  }, []);

  const handleRestartComplete = useCallback(async () => {
    const data = await loadData();
    const newDay = data?.config ? getDayNum(data.config.startDate) : 1;
    // Mark the new Day 1 as already "revealed" for everyone on this device, so
    // the carried-over habits don't trigger a one-habit reveal ceremony — but
    // habits unlocking on later days still animate as normal.
    if (data?.config?.users) {
      for (const uid of Object.keys(data.config.users)) {
        localStorage.setItem(`habit-revealed-${uid}`, String(newDay));
      }
    }
    determineState(data, userId);
  }, [loadData, determineState, userId]);

  const refreshData = useCallback(async () => {
    const data = await loadData();
    if (data) setAppData(data);
  }, [loadData]);

  if (state === 'loading') {
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          fontFamily: titleFont, fontSize: 42, color: ink,
          animation: 'fade-in 0.5s ease',
        }}>
          30·days
        </div>
        <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft }}>
          loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: '100%', height: '100%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, padding: 24,
      }}>
        <div style={{ fontFamily: titleFont, fontSize: 28, color: ink }}>oops</div>
        <div style={{ fontFamily: handFont, fontSize: 16, color: inkSoft, textAlign: 'center' }}>{error}</div>
        <button
          onClick={() => { setError(null); setState('loading'); loadData(); }}
          style={{
            marginTop: 8, padding: '10px 24px', background: ink, color: paper,
            border: 'none', borderRadius: 6, fontFamily: handFont, fontSize: 16, cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (state === 'setup') {
    return <SetupScreen onComplete={handleSetupComplete} isMobile={isMobile} />;
  }

  if (state === 'restart') {
    return (
      <SetupScreen
        mode="restart"
        initialConfig={appData?.config}
        currentDay={appData?.config ? getDayNum(appData.config.startDate) : 1}
        onComplete={handleRestartComplete}
        onCancel={() => setState('app')}
        isMobile={isMobile}
      />
    );
  }

  if (state === 'auth') {
    return (
      <PinGate
        config={appData?.config}
        onAuth={handleAuth}
        isMobile={isMobile}
      />
    );
  }

  if (state === 'reveal') {
    return (
      <RevealCalendar
        config={appData?.config}
        userId={userId}
        onDone={handleRevealDone}
        isMobile={isMobile}
      />
    );
  }

  if (state === 'app') {
    return (
      <TabbedApp
        appData={appData}
        userId={userId}
        onMutate={mutate}
        onLogout={handleLogout}
        onRestart={handleRestart}
        onRefresh={refreshData}
        lastSync={lastSync}
        isMobile={isMobile}
      />
    );
  }

  return null;
}
