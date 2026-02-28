import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInAnonymously, signInWithPopup,
  GoogleAuthProvider, signOut, onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

// ─── Firebase ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const APP_ID = import.meta.env.VITE_APP_ID || 'panel-manager-v1';
const ADMIN_EMAIL = 'harshpandhehome@gmail.com';

// ─── Panel Data ────────────────────────────────────────────────────────
const INITIAL_PANELS = {
  "Panel 1": ["TreeCode", "Spaghetti-404", "Tech Titans", "Garud_X", "Knight Riders", "VishnuBytes", "INORA", "agrinext", "Code4Cause", "HackTheFuture", "TechTrackers", "Titans"],
  "Panel 2": ["Meow", "Genesis", "Krishi Care", "Agri-it", "DevOrigin", "Godvenus", "HackOps!", "Valley techies", "CATALYST CORPS", "npx create", "Code Breakers"],
  "Panel 3": ["Dolce Far Niente", "Hogriders", "Dev Pirates", "TurboTechies", "CodeBlooded", "Team 100x", "Bluescreen", "Team Debug", "EFN_FC", "CodeXcelerators", "TEAM HACKASTRA", "Chocolate Milkshake"],
  "Panel 4": ["Prime Innovators", "CtrlZ", "Morpheus builders", "DataHackers", "Recursive Impact", "SkillBridge", "Hell-X", "EduTech", "X Force", "NovaBytes", "TriadX", "Commited"],
  "Panel 5": ["Asphalt_404", "the_developers", "Code2Crop", "ShunyaCode", "E.X.E", "God's Plan", "Finovators", "Algorithm Addicts", "404 Not Founders", "Overclocked", "Neural Ninjas", "BlackBulls"],
  "Panel 6": ["Quanta5", "Problem Solvers", "TechByte", "Credit Crusaders", "ERROR_404", "PathFinders", "MoneyMind AI", "LearningRateZero", "Cosmic Compilers", "Team CredX", "Nexus Neon", "CODESTREAX"],
  "Panel 7": ["MindStack", "PEANUT BUTTER", "The RESTful Coders", "Team Genspark", "Poha Jalebi", "SKN_Moggers", "Team Async", "DDOS ME", "The Resonators", "BitByBit", "Penta NEUTRON", "Innovators"],
  "Panel 8": ["Runtime Terrors", "TeamX", "Team ZI0N", "GM HALAMMA", "AyuScan", "Team Ascend", "Ai Avengers", "GoldMiners", "Gameis Alice", "Lazy Loopers", "@Vortex", "Lifeline Innovators"],
  "Panel 9": ["Unexpected Outputs", "Healthnova", "GOONERS", "OriginX", "AITians", "Team Atlas", "Team CodeZilla", "HustleCult 3.0", "BugBuster Divas", "Glitch Club", "Shieldher", "Hamsini"],
  "Panel 10": ["DevX", "Anonymous Hackers", "Tech Geeks", "MahilaMitra", "PrachandCoders", "SafeHer", "CodeStars", "Codeflex", "Techno Rangers", "PixelPops", "HERWAY AI Safety Team", "SHEild001"],
};

// ─── Matrix Rain Canvas ────────────────────────────────────────────────
function MatrixRain() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const fontSize = 14;
    const cols = Math.floor(w / fontSize);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%^&*()アイウエオカキクケコサシスセソ';

    let raf;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? '#ffffff' : '#00ff41';
        ctx.fillText(ch, i * fontSize, y * fontSize);
        if (y * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

// ─── Terminal Box wrapper ───────────────────────────────────────────────
const TBox = ({ label, children, className = '', colorClass = 'glow-box' }) => (
  <div className={`relative border border-[#00ff41] ${colorClass} bg-black/80 ${className}`}>
    {label && (
      <div className="absolute -top-3 left-3 bg-black px-2 text-[10px] text-[#00ff41] tracking-widest uppercase font-mono">
        {label}
      </div>
    )}
    {children}
  </div>
);

// ─── Terminal button ────────────────────────────────────────────────────
const TBtn = ({ children, onClick, color = 'green', className = '' }) => {
  const styles = {
    green: 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] active:scale-95 glow-box',
    red: 'bg-[#ff3333]/10 border-[#ff3333] text-[#ff4444] hover:bg-[#ff3333] hover:text-black hover:shadow-[0_0_20px_rgba(255,51,51,0.6)] active:scale-95 glow-box-red',
    orange: 'bg-[#ff8800]/10 border-[#ffaa00] text-[#ffaa00] hover:bg-[#ff8800] hover:text-black hover:shadow-[0_0_20px_rgba(255,136,0,0.6)] active:scale-95 glow-box-orange',
    ghost: 'bg-transparent border-[#00ff41]/30 text-[#00cc33] hover:border-[#00ff41] hover:text-[#00ff41] hover:bg-[#00ff41]/5 active:scale-95',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 border font-mono text-xs tracking-[0.2em] uppercase font-bold transition-all duration-150 ${styles[color]} ${className}`}
    >
      <span style={{ fontSize: '10px' }}>▶</span>{children}
    </button>
  );
};

// ─── Status badge ───────────────────────────────────────────────────────
const badge = (status, isNext) => {
  if (status === 'current') return { cls: 'border-[#ff4444] bg-[#ff3333]/20 text-[#ff6666] glow-box-red', label: '● PRESENTING' };
  if (isNext) return { cls: 'border-[#ffaa00] bg-[#ff8800]/15 text-[#ffcc44] glow-box-orange', label: '◆ NEXT' };
  if (status === 'done') return { cls: 'border-[#00ff41]/25 bg-transparent text-[#00aa55]', label: '✓ DONE' };
  return { cls: 'border-[#00ff41]/50 bg-[#001a00] text-[#a0ffb0]', label: '○ QUEUED' };
};

// ─── App ────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [selectedPanel, setSelectedPanel] = useState('');
  const [panelData, setPanelData] = useState(null);
  const [allPanelsData, setAllPanelsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(new Date().toLocaleTimeString());
  const [authError, setAuthError] = useState('');
  const [initText, setInitText] = useState('> SYSTEM INITIALIZING...');

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // Typewriter init line
  useEffect(() => {
    const lines = ['> SYSTEM INITIALIZING...', '> LOADING PROTOCOLS...', '> HACKATHON PANEL MANAGER v2.0', '> ACCESS GRANTED'];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % lines.length; setInitText(lines[i]); }, 2200);
    return () => clearInterval(t);
  }, []);

  // Auth
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  // Guard dashboard
  useEffect(() => {
    if (!loading && (view === 'dashboard' || view === 'projector') && !isAdmin)
      setView('landing');
  }, [view, isAdmin, loading]);

  // Single panel sync
  useEffect(() => {
    if (!user || !selectedPanel) return;
    const id = selectedPanel.replace(/\s+/g, '_').toLowerCase();
    const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'panel_configs', id);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) { setPanelData(snap.data()); }
      else { setDoc(ref, { name: selectedPanel, teams: INITIAL_PANELS[selectedPanel].map((n, i) => ({ name: n, status: 'pending', order: i })) }); }
    });
    return () => unsub();
  }, [user, selectedPanel]);

  // All panels sync
  useEffect(() => {
    if (!user) return;
    const unsubs = Object.keys(INITIAL_PANELS).map(panel => {
      const id = panel.replace(/\s+/g, '_').toLowerCase();
      const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'panel_configs', id);
      return onSnapshot(ref, snap => {
        if (snap.exists()) setAllPanelsData(p => ({ ...p, [panel]: snap.data() }));
        else setDoc(ref, { name: panel, teams: INITIAL_PANELS[panel].map((n, i) => ({ name: n, status: 'pending', order: i })) });
      });
    });
    return () => unsubs.forEach(u => u());
  }, [user]);

  const updateTeams = async teams => {
    if (!user || !selectedPanel) return;
    const id = selectedPanel.replace(/\s+/g, '_').toLowerCase();
    await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'panel_configs', id), { teams });
  };

  const moveTeam = (idx, dir) => {
    if (!panelData) return;
    const t = [...panelData.teams], to = idx + dir;
    if (to < 0 || to >= t.length) return;
    [t[idx], t[to]] = [t[to], t[idx]];
    updateTeams(t);
  };

  const setStatus = (idx, status) => {
    if (!panelData) return;
    const t = [...panelData.teams];
    if (status === 'current') t.forEach(x => { if (x.status === 'current') x.status = 'done'; });
    t[idx].status = status;
    updateTeams(t);
  };

  const resetPanel = async () => {
    if (!selectedPanel) return;
    const id = selectedPanel.replace(/\s+/g, '_').toLowerCase();
    await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'panel_configs', id), {
      name: selectedPanel,
      teams: INITIAL_PANELS[selectedPanel].map((n, i) => ({ name: n, status: 'pending', order: i }))
    });
  };

  const handleAdminLogin = async () => {
    setAuthError('');
    try {
      const r = await signInWithPopup(auth, googleProvider);
      if (r.user.email !== ADMIN_EMAIL) {
        await signOut(auth); await signInAnonymously(auth);
        setAuthError('⚠ ACCESS DENIED — unauthorized identity');
      }
    } catch { setAuthError('⚠ LOGIN FAILED — try again'); }
  };

  const handleAdminLogout = async () => {
    await signOut(auth); await signInAnonymously(auth);
    setView('landing'); setPanelData(null); setSelectedPanel('');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black text-[#00ff41] font-mono text-sm glow">
      <MatrixRain />
      <span className="relative z-10">&gt; BOOTING SYSTEM<span className="blink">_</span></span>
    </div>
  );

  // ─── NAV BAR ───────────────────────────────────────────────────────────
  const Header = () => (
    <header className="relative z-50 border-b border-[#003300] bg-black/90 backdrop-blur px-6 py-3 flex justify-between items-center sticky top-0"
      style={{ boxShadow: '0 1px 0 #003300, 0 2px 20px rgba(0,255,65,0.05)' }}>
      <button
        onClick={() => { setView('landing'); setPanelData(null); setSelectedPanel(''); }}
        className="text-[#00ff41] font-mono text-sm tracking-widest glow hover:text-white transition-colors flex items-center gap-2"
      >
        <span className="text-[#00cc33]">[</span>
        HACKATHON_PANEL_MGR
        <span className="text-[#00cc33]">]</span>
      </button>
      <div className="flex items-center gap-4 text-xs font-mono">
        {isAdmin && view !== 'landing' && (
          <span className="text-[#00cc33] tracking-widest">{view === 'projector-all' ? '// ALL_PANELS' : `// ${selectedPanel.toUpperCase()}`}</span>
        )}
        {isAdmin ? (
          <button onClick={handleAdminLogout} className="text-[#ff3333] border border-[#ff3333]/40 px-3 py-1 hover:bg-[#ff3333] hover:text-black transition-all tracking-widest text-[10px]">
            ▶ SIGN_OUT
          </button>
        ) : (
          <button onClick={handleAdminLogin} className="text-[#00cc33] border border-[#003300] px-3 py-1 hover:border-[#00ff41] hover:text-[#00ff41] transition-all tracking-widest text-[10px]">
            ▶ ADMIN
          </button>
        )}
      </div>
    </header>
  );

  // ─── LANDING ───────────────────────────────────────────────────────────
  if (view === 'landing') return (
    <div className="min-h-screen bg-black relative">
      <MatrixRain />
      <Header />
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16">

        {/* Boot line */}
        <p className="text-[#00cc33] text-xs tracking-[0.3em] mb-6 slide-in">{initText}<span className="blink">█</span></p>

        {/* Title */}
        <h1 className="fade-up delay-100 mb-3 leading-tight" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(22px, 5vw, 42px)', color: '#00ff41', textShadow: '0 0 20px #00ff41, 0 0 60px #00cc33' }}>
          HACKATHON<br />PANEL MANAGER
        </h1>
        <p className="fade-up delay-200 text-[#00cc33] text-sm tracking-widest mb-10">
          &gt; WAKE UP. BUILD THE FUTURE.
        </p>

        {authError && (
          <div className="mb-6 border border-[#ff3333] bg-[#ff3333]/10 px-4 py-3 text-[#ff3333] text-xs font-mono tracking-wider">{authError}</div>
        )}

        {/* CTA row */}
        <div className="fade-up delay-300 flex flex-wrap gap-4 mb-16">
          <TBtn onClick={() => setView('projector-all')} color="green" className="text-sm py-3 px-6">
            ALL PANELS LIVE
          </TBtn>
          {!isAdmin && (
            <TBtn onClick={handleAdminLogin} color="ghost" className="text-sm py-3 px-6">
              ADMIN LOGIN
            </TBtn>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up delay-400 grid grid-cols-3 gap-4 mb-14 max-w-lg">
          {[
            { v: Object.keys(INITIAL_PANELS).length, l: 'PANELS' },
            { v: Object.values(INITIAL_PANELS).reduce((s, t) => s + t.length, 0), l: 'TEAMS' },
            { v: '10×', l: 'LIVE SYNC' },
          ].map(({ v, l }) => (
            <TBox key={l} label={l} className="p-4 text-center">
              <div className="text-3xl font-mono glow font-bold">{v}</div>
            </TBox>
          ))}
        </div>

        {/* Admin panel grid */}
        {isAdmin && (
          <div className="fade-up delay-500">
            <p className="text-[#00cc33]/50 text-[10px] tracking-[0.4em] mb-4">&gt; SELECT_TARGET_PANEL</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.keys(INITIAL_PANELS).map(panel => (
                <button key={panel}
                  onClick={() => { setSelectedPanel(panel); setView('dashboard'); }}
                  className="py-3 px-3 border border-[#003300] text-[#00cc33] text-[10px] tracking-widest font-mono uppercase hover:border-[#00ff41] hover:text-[#00ff41] hover:bg-[#00ff41]/5 transition-all"
                >
                  {panel}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ─── DASHBOARD ─────────────────────────────────────────────────────────
  if (view === 'dashboard' && isAdmin) return (
    <div className="min-h-screen bg-black relative">
      <MatrixRain />
      <Header />
      <div className="relative z-10 max-w-5xl mx-auto p-6 space-y-6">

        {/* Panel header */}
        <TBox className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[#00cc33]/60 text-[10px] tracking-[0.4em] mb-1">&gt; MANAGING</p>
            <h2 className="text-[#00ff41] glow font-mono text-2xl tracking-widest">{panelData?.name?.toUpperCase() || '...'}</h2>
            <p className="text-[#003300] text-xs tracking-wider mt-1">UPDATE TEAM STATUS AND SEQUENCE IN REAL-TIME</p>
          </div>
          <div className="flex gap-3">
            <TBtn onClick={() => setView('projector')} color="green">PROJECTOR MODE</TBtn>
            <TBtn onClick={resetPanel} color="red">RESET PANEL</TBtn>
          </div>
        </TBox>

        {/* Table */}
        {panelData ? (
          <TBox label="// TEAM_QUEUE" className="overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#003300]">
                <tr className="text-[#003300] text-[10px] tracking-widest">
                  <th className="p-4">#</th>
                  <th className="p-4">TEAM_NAME</th>
                  <th className="p-4 text-center">MOVE</th>
                  <th className="p-4 text-right">CONTROL</th>
                </tr>
              </thead>
              <tbody>
                {panelData.teams.map((team, idx) => {
                  const curIdx = panelData.teams.findIndex(t => t.status === 'current');
                  const isNext = curIdx === -1
                    ? panelData.teams.findIndex(t => t.status === 'pending') === idx
                    : curIdx + 1 === idx;
                  const { cls, label } = badge(team.status, isNext);
                  return (
                    <tr key={idx} className={`border-b border-[#001a00] transition-all ${team.status === 'current' ? 'bg-[#ff3333]/5' : 'hover:bg-[#00ff41]/[0.02]'}`}>
                      <td className="p-4 text-[#003300]">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="p-4">
                        <div className={`font-mono tracking-wider ${team.status === 'current' ? 'text-[#ff3333] glow-red' : team.status === 'done' ? 'text-[#003300]' : 'text-[#00ff41]'}`}>
                          {team.name}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 border text-[9px] tracking-widest ${cls}`}>{label}</span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => moveTeam(idx, -1)} disabled={idx === 0}
                            className="w-7 h-7 flex items-center justify-center border border-[#00ff41]/20 text-[#00ff41]/50 hover:border-[#00ff41] hover:text-[#00ff41] hover:bg-[#00ff41]/10 disabled:opacity-10 transition-all font-mono text-sm">
                            ▲
                          </button>
                          <button onClick={() => moveTeam(idx, 1)} disabled={idx === panelData.teams.length - 1}
                            className="w-7 h-7 flex items-center justify-center border border-[#00ff41]/20 text-[#00ff41]/50 hover:border-[#00ff41] hover:text-[#00ff41] hover:bg-[#00ff41]/10 disabled:opacity-10 transition-all font-mono text-sm">
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {team.status !== 'done' ? (
                          <button
                            onClick={() => setStatus(idx, team.status === 'current' ? 'done' : 'current')}
                            className={`inline-flex items-center gap-2 px-5 py-2 border font-mono text-xs font-bold tracking-widest uppercase transition-all duration-150 active:scale-95 ${team.status === 'current'
                              ? 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,65,0.6)] glow-box'
                              : 'bg-[#ff3333]/10 border-[#ff3333] text-[#ff4444] hover:bg-[#ff3333] hover:text-black hover:shadow-[0_0_20px_rgba(255,51,51,0.6)] glow-box-red'
                              }`}
                          >
                            <span style={{ fontSize: '10px' }}>▶</span>
                            {team.status === 'current' ? 'MARK DONE' : 'START'}
                          </button>
                        ) : (
                          <button onClick={() => setStatus(idx, 'pending')}
                            className="px-4 py-2 border border-[#00ff41]/20 text-[#00ff41]/40 text-[10px] tracking-widest font-mono uppercase hover:border-[#00ff41]/60 hover:text-[#00ff41]/70 transition-all">
                            UNDO
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TBox>
        ) : (
          <div className="text-[#003300] text-xs font-mono tracking-widest py-16 text-center">&gt; LOADING PANEL DATA<span className="blink">_</span></div>
        )}
      </div>
    </div>
  );

  // ─── ALL-PANELS PROJECTOR ──────────────────────────────────────────────
  if (view === 'projector-all') {
    const panelNames = Object.keys(INITIAL_PANELS);
    const allLoaded = panelNames.every(p => allPanelsData[p]);
    return (
      <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
        <MatrixRain />
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Header bar */}
          <div className="flex justify-between items-center mb-3 flex-shrink-0 border-b border-[#003300] pb-3">
            <div>
              <h1 className="text-[#00ff41] glow font-mono text-lg tracking-widest">&gt; ALL_PANELS // LIVE_OVERVIEW</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="live-ring-green w-2 h-2 rounded-full bg-[#00ff41] inline-block"></span>
                <span className="text-[#003300] text-[9px] tracking-[0.3em] font-mono">REALTIME SYNC ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TBtn onClick={() => setView('landing')} color="ghost" className="text-[10px] py-1">EXIT</TBtn>
            </div>
          </div>

          {!allLoaded ? (
            <div className="flex-1 flex items-center justify-center text-[#003300] font-mono text-sm tracking-widest">
              &gt; SYNCING PANELS<span className="blink">_</span>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 overflow-y-auto">
              {panelNames.map(panelName => {
                const data = allPanelsData[panelName];
                if (!data) return null;
                const teams = data.teams || [];
                const curIdx = teams.findIndex(t => t.status === 'current');
                const doneCount = teams.filter(t => t.status === 'done').length;
                const total = teams.length;

                return (
                  <div key={panelName} className="border border-[#003300] bg-black/80 p-2 flex flex-col gap-1.5 overflow-hidden hover:border-[#00ff41]/30 transition-colors">
                    {/* Panel title */}
                    <div className="flex justify-between items-center flex-shrink-0">
                      <span className="text-[#00ff41] text-[9px] font-mono tracking-widest">{panelName.toUpperCase()}</span>
                      <span className="text-[#003300] text-[8px] font-mono">{doneCount}/{total}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-px bg-[#001a00] flex-shrink-0">
                      <div className="h-px bg-[#00ff41] transition-all duration-700" style={{ width: `${(doneCount / total) * 100}%` }} />
                    </div>
                    {/* Team squares */}
                    <div className="flex flex-wrap gap-1 overflow-hidden">
                      {teams.map((team, idx) => {
                        const isNext = curIdx !== -1
                          ? idx === curIdx + 1 && team.status === 'pending'
                          : teams.findIndex(t => t.status === 'pending') === idx;
                        const { cls } = badge(team.status, isNext);
                        return (
                          <div key={idx} title={team.name}
                            className={`border px-1 py-0.5 text-[8px] font-mono truncate transition-all duration-300 ${cls}`}
                            style={{ flex: '0 0 calc(50% - 2px)' }}
                          >
                            {team.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="flex-shrink-0 pt-2 border-t border-[#003300] mt-2 flex justify-between items-center text-[9px] font-mono text-[#003300] tracking-widest">
            <div className="flex gap-4">
              <span className="text-[#ff3333]">● PRESENTING</span>
              <span className="text-[#ff8800]">◆ NEXT</span>
              <span className="text-[#00cc33]/60">✓ DONE</span>
            </div>
            <span>SYNC_ACTIVE // {clock}</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── SINGLE PANEL PROJECTOR ────────────────────────────────────────────
  if (view === 'projector' && panelData && isAdmin) return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      <MatrixRain />
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-shrink-0">
          <div>
            <p className="text-[#003300] text-[10px] font-mono tracking-[0.4em] mb-1">&gt; LIVE_PRESENTATION_QUEUE</p>
            <h1 className="text-[#00ff41] font-mono tracking-widest glow" style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}>
              {panelData.name.toUpperCase()}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="live-ring-green w-2 h-2 rounded-full bg-[#00ff41] inline-block"></span>
              <span className="text-[#003300] text-[9px] tracking-[0.3em] font-mono">SYNC ACTIVE</span>
            </div>
          </div>
          <TBtn onClick={() => setView('dashboard')} color="ghost" className="text-[10px]">BACK</TBtn>
        </div>

        {/* Team grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto">
          {panelData.teams.map((team, idx) => {
            const curIdx = panelData.teams.findIndex(t => t.status === 'current');
            const isNext = curIdx !== -1
              ? idx === curIdx + 1 && team.status === 'pending'
              : panelData.teams.findIndex(t => t.status === 'pending') === idx;
            const { cls } = badge(team.status, isNext);
            return (
              <div key={idx} className={`border p-3 flex flex-col justify-between min-h-[100px] transition-all duration-500 bg-black/80 ${cls}`}>
                <div className="text-[10px] font-mono opacity-30 mb-auto">{String(idx + 1).padStart(2, '0')}</div>
                <div className="font-mono text-sm tracking-wider leading-tight uppercase mt-2">{team.name}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-[#003300] mt-4 flex justify-between items-center text-[9px] font-mono text-[#003300] tracking-widest">
          <div className="flex gap-6">
            <span className="text-[#ff3333]">● PRESENTING</span>
            <span className="text-[#ff8800]">◆ NEXT</span>
            <span className="text-[#00cc33]/60">✓ DONE</span>
          </div>
          <span>{clock}</span>
        </div>
      </div>
    </div>
  );

  return null;
}
