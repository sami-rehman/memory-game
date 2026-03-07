// ============================================================
// Memory Game Platform — Main Application
// ============================================================
// Game and Admin UI. Data is live only (Firebase required).
// ============================================================

import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

import { DataProvider, useData } from "./hooks/useData";
import { ROUNDS, FONT_URL, FONT_FAMILY, CURIOSITY_HOOKS, ROUND_CURIOSITY, EMOTION_REGULATION_PROMPTS, ROUND_END_SELF_EFFICACY } from "./config/gameContent";
import { generateRound, getFeedback } from "./utils";
import { playFeedbackForKids, unlockAudio } from "./utils/feedbackAudio";
import { Img, TimerBar, Btn, P, CHART_COLORS, GlobalStyles } from "./components/shared";
import { AdminLogin } from "./components/AdminLogin";
import { isFirebaseConfigured } from "./firebase/config";
import { clearAllFirestoreData } from "./firebase/service";
import { isAdminAuthenticated, clearAdminSession } from "./auth/adminAuth";
import type {
  GameSession, Submission, RoundConfig, RoundData,
  Question, AnswerResult, SurveyAnswers,
} from "./types";

const ff = FONT_FAMILY;

// Timers on by default. Set REACT_APP_DISABLE_TIMERS=true in .env to disable them for testing.
const DISABLE_TIMERS = process.env.REACT_APP_DISABLE_TIMERS === "true";

// ================================================================
// 🎮 GAME SCREENS
// ================================================================

function GameEntry({ onStart }: { onStart: (s: GameSession) => void }) {
  const data = useData();
  const [studentName, setStudentName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [dg, setDg] = useState<"A" | "B" | "AUTO">("AUTO");
  const [msg, setMsg] = useState("");

  const pickRandomGroup = (): "A" | "B" => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const u = new Uint32Array(1);
      crypto.getRandomValues(u);
      return u[0] % 2 === 0 ? "A" : "B";
    }
    return Math.random() < 0.5 ? "A" : "B";
  };

  const go = () => {
    if (!studentName.trim() || !age.trim() || !grade.trim()) return;
    const id = studentName.trim();
    let s = data.getStudent(id);
    const isNew = !s;
    if (!s) s = data.addStudent({ studentId: id, age: parseInt(age, 10), grade: grade.trim() });
    const group: "A" | "B" = dg === "A" ? "A" : dg === "B" ? "B" : pickRandomGroup();
    setMsg(isNew ? `Registered! Group ${group}${group === "B" ? " (Feedback)" : ""}.` : `Welcome back, ${id}! Group ${group}.`);
    setTimeout(() => onStart({ ...s!, group, sessionStart: new Date().toISOString() }), 600);
  };

  const inp: React.CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 14, border: "3px solid #E5E7EB", fontSize: 17, textAlign: "center", outline: "none", boxSizing: "border-box", fontFamily: ff };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(170deg,#818CF8,#C084FC 40%,#F9A8D4)", padding: 16, fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" />
      <GlobalStyles />
      <div style={{ background: P.w, borderRadius: 30, padding: "32px 28px", maxWidth: 380, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.18)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70 }}>🧠</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: P.slate, margin: 0 }}>Memory Challenge!</h1>
          <p style={{ color: P.slateL, marginTop: 4, fontSize: 14 }}>Enter your name to play</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="✨ Student name" style={{ ...inp, fontSize: 20, fontWeight: 800, letterSpacing: 3, color: P.purple }} onKeyDown={(e) => e.key === "Enter" && go()} />
          <div style={{ display: "flex", gap: 8 }}>
            <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="5" max="14" placeholder="Age *" style={{ ...inp, flex: 1 }} />
            <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Class *" style={{ ...inp, flex: 1 }} />
          </div>
          <p style={{ fontSize: 11, color: P.slateL, margin: "-4px 0 0", textAlign: "center" }}>* Required to play</p>
          {msg && <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: P.green, padding: 6, background: P.greenL, borderRadius: 10 }}>{msg}</div>}
          <Btn onClick={() => { unlockAudio(); go(); }} dis={!studentName.trim() || !age.trim() || !grade.trim()} c="#7C3AED" style={{ width: "100%", marginTop: 2 }}>🚀 Let's Play!</Btn>
        </div>
        <div style={{ marginTop: 18, padding: "10px 12px", background: P.yellowL, borderRadius: 14, border: "2px dashed #F59E0B" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#92400E", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🔧 Dev</div>
          <div style={{ display: "flex", gap: 6 }}>
            {([{ v: "A" as const, l: "A (No Feedback)" }, { v: "B" as const, l: "B (Feedback)" }, { v: "AUTO" as const, l: "Auto (Random)" }]).map((g) => (
              <button key={g.v} onClick={() => setDg(g.v)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: dg === g.v ? "2px solid #F59E0B" : "2px solid #E5E7EB", background: dg === g.v ? "#FEF3C7" : P.w, fontSize: 11, fontWeight: 700, cursor: "pointer", color: dg === g.v ? "#92400E" : P.slateL, fontFamily: ff }}>{g.l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundIntro({ rc, ri, total, onGo }: { rc: RoundConfig; ri: number; total: number; onGo: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => { if (n <= 0) { onGo(); return; } const t = setTimeout(() => setN(n - 1), 1000); return () => clearTimeout(t); }, [n]);
  const bgs = ["linear-gradient(135deg,#6366F1,#8B5CF6)", "linear-gradient(135deg,#059669,#10B981)", "linear-gradient(135deg,#EA580C,#F59E0B)", "linear-gradient(135deg,#DB2777,#EC4899)"];
  const icons = ["🐾", "🥕", "🌍"];
  const curiosityLine = ROUND_CURIOSITY[rc.round] ?? CURIOSITY_HOOKS[ri % CURIOSITY_HOOKS.length];
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: bgs[ri % 4], color: P.w, textAlign: "center", padding: 20, fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3, opacity: .7 }}>{rc.diff} • {ri + 1}/{total}</div>
      <div style={{ fontSize: 60, margin: "12px 0" }}>{icons[ri % 4]}</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px" }}>{rc.label}</h1>
      <p style={{ fontSize: 17, opacity: .9, margin: "0 0 8px" }}>{rc.tagline}</p>
      <p style={{ fontSize: 15, opacity: .95, margin: "0 0 4px", fontStyle: "italic" }}>{curiosityLine}</p>
      <div style={{ display: "flex", gap: 14, marginBottom: 28, fontSize: 13, fontWeight: 600, opacity: .8, flexWrap: "wrap", justifyContent: "center" }}>
        <span>📸 {rc.imageCount}</span><span>⏱️ {rc.memTime}s</span><span>❓ {rc.questionCount}</span>
      </div>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, fontWeight: 900, animation: "bn .8s ease infinite" }}>{n > 0 ? n : "GO!"}</div>
    </div>
  );
}

function MemPhase({ items, dur, label, onDone }: { items: any[]; dur: number; label: string; onDone: (ms: number) => void }) {
  const [on, setOn] = useState(true); const st = useRef(Date.now());
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(170deg,#1E293B,#0F172A)", color: P.w, padding: "22px 14px", fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div style={{ fontSize: 11, fontWeight: 700, opacity: .5, textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 4px" }}>👀 Look carefully!</h2>
      <p style={{ fontSize: 13, opacity: .5, margin: "0 0 14px" }}>Remember every picture!</p>
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 22, paddingTop: 4 }}>
        {DISABLE_TIMERS ? (
          <Btn onClick={() => { setOn(false); onDone(Date.now() - st.current); }} c="#8B5CF6" sm>Continue →</Btn>
        ) : (
          <TimerBar dur={dur} onEnd={() => { setOn(false); onDone(Date.now() - st.current); }} on={on} color="#8B5CF6" />
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: items.length <= 4 ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12, maxWidth: 480, width: "100%", justifyItems: "center" }}>
        {items.map((item: any, i: number) => <div key={item.id} style={{ animation: `fu .4s ease ${i * .07}s both` }}><Img item={item} size={items.length <= 4 ? 225 : 175} /></div>)}
      </div>
    </div>
  );
}

function Dist({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => { if (n <= 0) { onDone(); return; } const t = setTimeout(() => setN(n - 1), 1000); return () => clearTimeout(t); }, [n]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", color: P.w, textAlign: "center", padding: 20, fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div style={{ fontSize: 72, marginBottom: 12, animation: "wob 2s infinite" }}>🤔</div>
      <h2 style={{ fontSize: 26, fontWeight: 800 }}>Get Ready!</h2>
      <p style={{ fontSize: 18, opacity: .85, marginTop: 6 }}>Questions in <strong>{n > 0 ? n : "..."}</strong></p>
    </div>
  );
}

function Quiz({ q, qi, tot, time, group, onAns }: { q: Question; qi: number; tot: number; time: number; group: string; onAns: (r: AnswerResult) => void }) {
  const [sel, setSel] = useState<any>(null);
  const [fbk, setFbk] = useState<any>(null);
  const [emotionReg, setEmotionReg] = useState<string | null>(null);
  const [on, setOn] = useState(true);
  const [to, setTo] = useState(false);
  const st = useRef(Date.now());

  const proc = (opt: any, isTO: boolean) => {
    const ms = Date.now() - st.current;
    const ok = opt?.id === q.correct.id;
    if (group === "B") {
      const message = getFeedback(isTO ? "timeout" : ok ? "correct" : "incorrect", q.correct.name);
      const er = !ok || isTO ? EMOTION_REGULATION_PROMPTS[Math.floor(Math.random() * EMOTION_REGULATION_PROMPTS.length)] : null;
      setFbk(message);
      setEmotionReg(er);
      playFeedbackForKids(ok, isTO, message.t, message.s, er).then(() => {
        onAns({ sel: opt, ok, to: isTO, ms });
      });
    } else setTimeout(() => onAns({ sel: opt, ok, to: isTO, ms }), 800);
  };
  const pick2 = (o: any) => { if (sel || to) return; unlockAudio(); setSel(o); setOn(false); proc(o, false); };
  const tout = () => { if (sel) return; setTo(true); setOn(false); proc(null, true); };
  const done = sel || to;
  const ok = sel?.id === q.correct.id;
  const obg = (o: any) => { if (!done) return P.w; if (o.id === q.correct.id) return P.greenL; if (sel?.id === o.id && !ok) return P.redL; return "#F8FAFC"; };
  const obd = (o: any) => { if (!done) return "3px solid #E5E7EB"; if (o.id === q.correct.id) return `3px solid ${P.green}`; if (sel?.id === o.id && !ok) return `3px solid ${P.red}`; return "3px solid #E5E7EB"; };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[linear-gradient(170deg,#1E293B,#0F172A)] text-white px-3 py-[18px] font-game">
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div className="flex gap-[5px] mb-1">
        {Array.from({ length: tot }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-1.5 rounded-full shrink-0"
            style={{ background: i < qi ? P.purple : i === qi ? "#F59E0B" : "rgba(255,255,255,.15)" }}
          />
        ))}
      </div>
      <div className="text-xs font-bold opacity-50 mb-1">Q{qi + 1}/{tot}</div>
      {!DISABLE_TIMERS && (
        <div className="w-full max-w-[480px] mb-[18px] pt-1"><TimerBar dur={time} onEnd={tout} on={on} color="#F59E0B" /></div>
      )}
      <h2 className="text-xl font-extrabold text-center mb-4 m-0">{q.qText}</h2>
      <div className="grid grid-cols-2 gap-2.5 max-w-[420px] w-full">
        {q.opts.map((o) => (
          <button
            key={o.id}
            onClick={() => pick2(o)}
            disabled={done}
            className={`min-w-0 p-2 rounded-[18px] transition-all duration-200 flex flex-col items-center gap-0.5 ${done ? "cursor-default" : "cursor-pointer"}`}
            style={{ background: obg(o), border: obd(o) }}
          >
            <Img item={o} size={180} label={false} objectFit="cover" className="!border-0 !shadow-none max-w-full" style={{ maxWidth: "100%" }} />
            <div className="text-sm font-extrabold text-slate font-game">{o.name}</div>
          </button>
        ))}
      </div>
      {group === "A" && done && <div className="mt-5 text-[15px] opacity-40 font-bold">Next →</div>}
      {group === "B" && fbk && (
        <div
          className="mt-5 px-5 py-3.5 rounded-[20px] max-w-[420px] w-full text-center animate-pi"
          style={{
            background: ok ? P.greenL : to ? P.yellowL : P.redL,
            border: `3px solid ${ok ? P.green : to ? P.yellow : P.red}`,
          }}
        >
          <div className="text-[17px] font-extrabold text-slate font-game">{fbk.t}</div>
          <div className="text-[13px] font-semibold text-slate-light mt-0.5 font-game">{fbk.s}</div>
          {emotionReg && (
            <div className="text-[12px] font-semibold text-slate mt-2 pt-2 border-t border-slate/20 font-game">{emotionReg}</div>
          )}
        </div>
      )}
    </div>
  );
}

function RoundEnd({ rn, total, ok, tot, group, onNext }: any) {
  const pct = Math.round((ok / tot) * 100);
  const efficacyTier = pct >= 80 ? "high" : pct >= 50 ? "mid" : "low";
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1E293B,#0F172A)", color: P.w, textAlign: "center", padding: 20, fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div style={{ fontSize: 64, marginBottom: 12 }}>{pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "💪"}</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px" }}>Round {rn} Done!</h2>
      {group === "B" ? <>
        <div style={{ fontSize: 40, fontWeight: 900, color: pct >= 50 ? P.green : P.orange }}>{ok}/{tot}</div>
        <p style={{ fontSize: 15, opacity: .85 }}>{pct >= 80 ? "Incredible memory!" : pct >= 50 ? "Good work!" : "Nice effort!"}</p>
        <p style={{ fontSize: 14, opacity: .9, marginTop: 4, fontStyle: "italic" }}>{ROUND_END_SELF_EFFICACY[efficacyTier]}</p>
      </> : <p style={{ fontSize: 15, opacity: .5 }}>Round complete.</p>}
      <Btn onClick={onNext} style={{ marginTop: 24 }}>{rn < total ? "Next Round →" : "Almost Done! →"}</Btn>
    </div>
  );
}

function SurveyScr({ onSubmit }: { onSubmit: (a: SurveyAnswers) => void }) {
  const [a, setA] = useState<SurveyAnswers>({ enjoyment: null, playAgain: null, selfEfficacy: null });
  const sc = [{ v: 1, e: "😟", l: "No" }, { v: 2, e: "😐", l: "A little" }, { v: 3, e: "😊", l: "Yes!" }, { v: 4, e: "😄", l: "A lot!" }];
  const Q = ({ label, field }: { label: string; field: keyof SurveyAnswers }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: P.slate, marginBottom: 10, fontFamily: ff }}>{label}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {sc.map((s) => <button key={s.v} onClick={() => setA({ ...a, [field]: s.v })} style={{ width: 68, padding: "10px 2px", borderRadius: 16, border: a[field] === s.v ? "3px solid #7C3AED" : "3px solid #E5E7EB", background: a[field] === s.v ? P.purpleL : P.w, cursor: "pointer", textAlign: "center", transition: "all .2s", transform: a[field] === s.v ? "scale(1.08)" : "scale(1)" }}>
          <div style={{ fontSize: 32 }}>{s.e}</div><div style={{ fontSize: 10, fontWeight: 700, color: P.slateL, marginTop: 2, fontFamily: ff }}>{s.l}</div>
        </button>)}
      </div>
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(170deg,#FEF3C7,#FCE7F3 50%,#EDE9FE)", padding: 14, fontFamily: ff }}>
      <link href={FONT_URL} rel="stylesheet" />
      <div style={{ background: P.w, borderRadius: 28, padding: "28px 24px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}><div style={{ fontSize: 44, marginBottom: 4 }}>📝</div><h2 style={{ fontSize: 22, fontWeight: 800, color: P.slate, margin: 0 }}>One more thing!</h2></div>
        <Q label="Did you have fun?" field="enjoyment" />
        <Q label="Would you play again?" field="playAgain" />
        <Q label="Feel good about your answers?" field="selfEfficacy" />
        <Btn onClick={() => onSubmit(a)} dis={!a.enjoyment || !a.playAgain || !a.selfEfficacy} c="#7C3AED" style={{ width: "100%" }}>All Done! ✨</Btn>
      </div>
    </div>
  );
}

// ================================================================
// 🎮 GAME CONTROLLER
// ================================================================

function Game() {
  const navigate = useNavigate();
  const data = useData();
  const [ph, setPh] = useState(0);
  const [stu, setStu] = useState<GameSession | null>(null);
  const [ri, setRi] = useState(0);
  const [rd, setRd] = useState<RoundData | null>(null);
  const [qi, setQi] = useState(0);
  const [ls, setLs] = useState<Submission[]>([]);
  const [rok, setRok] = useState(0);
  const [mms, setMms] = useState(0);
  const rc = ROUNDS[ri] || ROUNDS[0];

  const start = (s: GameSession) => {
    setStu(s); setRi(0); setLs([]);
    // Only update status in Firebase for returning students (already in DB); new students are written when they complete the quiz
    if (data.getStudent(s.studentId)) data.updateStatus(s.studentId, "playing");
    setPh(1);
  };
  const startR = () => { setRd(generateRound(rc)); setQi(0); setRok(0); setPh(2); };
  const onAns = (res: AnswerResult) => {
    const q = rd!.qs[qi];
    setLs((p) => [...p, { studentId: stu!.studentId, group: stu!.group, sessionId: stu!.sessionStart, round: ri + 1, questionIndex: qi, questionText: q.qText, correctAnswer: q.correct.name, selectedAnswer: res.sel?.name || null, isCorrect: res.ok, isTimeout: res.to, responseTimeMs: res.ms, imagesShown: rd!.shown.map((i) => i.name), memorizationTimeMs: mms, timestamp: new Date().toISOString() }]);
    if (res.ok) setRok((c) => c + 1);
    if (qi + 1 < rd!.qs.length) setQi((c) => c + 1); else setPh(5);
  };
  const nextR = () => { if (ri + 1 < ROUNDS.length) { setRi((r) => r + 1); setPh(1); } else setPh(6); };
  const submitSv = (a: SurveyAnswers) => {
    // Only write to Firebase when student completes the full quiz (all rounds + survey)
    data.saveStudentOnComplete({ ...stu!, status: "completed" });
    data.addSubs(ls);
    data.addSurvey({ ...a as any, studentId: stu!.studentId, group: stu!.group, sessionId: stu!.sessionStart, totalSessionDurationMs: Date.now() - new Date(stu!.sessionStart).getTime(), roundsCompleted: ROUNDS.length, quitEarly: false, timestamp: new Date().toISOString() });
    setPh(7);
  };
  const restart = () => { setPh(0); setStu(null); setLs([]); setRi(0); };

  if (ph === 0) return <GameEntry onStart={start} />;
  if (ph === 1) return <RoundIntro rc={rc} ri={ri} total={ROUNDS.length} onGo={startR} />;
  if (ph === 2) return <MemPhase items={rd!.shown} dur={rc.memTime} label={rc.label} onDone={(ms) => { setMms(ms); setPh(3); }} />;
  if (ph === 3) return <Dist onDone={() => setPh(4)} />;
  if (ph === 4) return <Quiz key={`${ri}-${qi}`} q={rd!.qs[qi]} qi={qi} tot={rd!.qs.length} time={rc.qTime} group={stu!.group} onAns={onAns} />;
  if (ph === 5) return <RoundEnd rn={ri + 1} total={ROUNDS.length} ok={rok} tot={rd!.qs.length} group={stu!.group} onNext={nextR} />;
  if (ph === 6) return <SurveyScr onSubmit={submitSv} />;

  // Phase 7: Done
  const tok = ls.filter((s) => s.isCorrect).length;
  const avg = ls.length ? Math.round(ls.reduce((a, s) => a + s.responseTimeMs, 0) / ls.length) : 0;
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#059669,#2563EB)", padding: "28px 14px", fontFamily: ff, color: P.w, textAlign: "center" }}>
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />
      <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Amazing Job!</h1>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", margin: "20px 0" }}>
        {[{ i: "🎯", l: "Score", v: `${tok}/${ls.length}` }, { i: "⚡", l: "Speed", v: `${(avg / 1000).toFixed(1)}s` }, { i: "🔬", l: "Group", v: stu!.group }].map((s) => (
          <div key={s.l} style={{ background: "rgba(255,255,255,.12)", borderRadius: 18, padding: "14px 20px", textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 22 }}>{s.i}</div><div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div><div style={{ fontSize: 10, opacity: .7 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Btn onClick={restart} sm>Play Again 🔄</Btn>
        <Btn onClick={() => navigate("/admin")} c={P.blue} sm>Admin 📊</Btn>
      </div>
    </div>
  );
}

// ================================================================
// 📊 ADMIN GATE (login required)
// ================================================================

function AdminGate() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated);

  const handleLogout = () => {
    clearAdminSession();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }
  return <Admin onLogout={handleLogout} />;
}

// ================================================================
// 📊 ADMIN DASHBOARD
// ================================================================

function Admin({ onLogout }: { onLogout: () => void }) {
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();
  const data = useData();
  const [tab, setTab] = useState("overview");
  const [newIds, setNewIds] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [filter, setFilter] = useState("all");
  const [addMode, setAddMode] = useState("single");

  const gA = data.getGroupSubs("A"), gB = data.getGroupSubs("B");
  const stats = {
    total: data.students.length,
    grpA: data.students.filter((s) => s.group === "A").length,
    grpB: data.students.filter((s) => s.group === "B").length,
    done: data.students.filter((s) => s.status === "completed").length,
    accA: gA.length ? Math.round((gA.filter((x) => x.isCorrect).length / gA.length) * 100) : 0,
    accB: gB.length ? Math.round((gB.filter((x) => x.isCorrect).length / gB.length) * 100) : 0,
    avgMsA: gA.length ? Math.round(gA.reduce((a, x) => a + x.responseTimeMs, 0) / gA.length) : 0,
    avgMsB: gB.length ? Math.round(gB.reduce((a, x) => a + x.responseTimeMs, 0) / gB.length) : 0,
    toA: gA.filter((x) => x.isTimeout).length,
    toB: gB.filter((x) => x.isTimeout).length,
  };

  const roundNumbers = ROUNDS.map((rc) => rc.round);
  const accByRound = roundNumbers.map((r) => {
    const a = gA.filter((x) => x.round === r), b = gB.filter((x) => x.round === r);
    return { round: `R${r}`, "Group A": a.length ? Math.round((a.filter((x) => x.isCorrect).length / a.length) * 100) : 0, "Group B": b.length ? Math.round((b.filter((x) => x.isCorrect).length / b.length) * 100) : 0 };
  });

  const speedByRound = roundNumbers.map((r) => {
    const a = gA.filter((x) => x.round === r), b = gB.filter((x) => x.round === r);
    return { round: `R${r}`, "Group A": a.length ? +(a.reduce((s, x) => s + x.responseTimeMs, 0) / a.length / 1000).toFixed(1) : 0, "Group B": b.length ? +(b.reduce((s, x) => s + x.responseTimeMs, 0) / b.length / 1000).toFixed(1) : 0 };
  });

  const statusData = [
    { name: "Completed", value: data.students.filter((s) => s.status === "completed").length, color: P.green },
    { name: "Playing", value: data.students.filter((s) => s.status === "playing").length, color: P.orange },
    { name: "Pending", value: data.students.filter((s) => s.status === "pending").length, color: P.slateL },
  ].filter((d) => d.value > 0);

  const allSubs = data.subs;
  const outcomeData = [
    { name: "Correct", value: allSubs.filter((x) => x.isCorrect).length, color: P.green },
    { name: "Incorrect", value: allSubs.filter((x) => !x.isCorrect && !x.isTimeout).length, color: P.red },
    { name: "Timeout", value: allSubs.filter((x) => x.isTimeout).length, color: P.orange },
  ].filter((d) => d.value > 0);

  const overallAccData = [
    { name: "No Feedback", accuracy: stats.accA, fill: CHART_COLORS.A },
    { name: "With Feedback", accuracy: stats.accB, fill: CHART_COLORS.B },
  ];

  const timeoutsByRound = roundNumbers.map((r) => {
    const a = gA.filter((x) => x.round === r && x.isTimeout).length;
    const b = gB.filter((x) => x.round === r && x.isTimeout).length;
    return { round: `R${r}`, "Group A": a, "Group B": b };
  });

  const surveyByGroup = [
    { metric: "Enjoyment", "Group A": data.surveys.filter((s) => s.group === "A").length ? +(data.surveys.filter((s) => s.group === "A").reduce((a, s) => a + s.enjoyment, 0) / data.surveys.filter((s) => s.group === "A").length).toFixed(1) : 0, "Group B": data.surveys.filter((s) => s.group === "B").length ? +(data.surveys.filter((s) => s.group === "B").reduce((a, s) => a + s.enjoyment, 0) / data.surveys.filter((s) => s.group === "B").length).toFixed(1) : 0 },
    { metric: "Play again", "Group A": data.surveys.filter((s) => s.group === "A").length ? +(data.surveys.filter((s) => s.group === "A").reduce((a, s) => a + s.playAgain, 0) / data.surveys.filter((s) => s.group === "A").length).toFixed(1) : 0, "Group B": data.surveys.filter((s) => s.group === "B").length ? +(data.surveys.filter((s) => s.group === "B").reduce((a, s) => a + s.playAgain, 0) / data.surveys.filter((s) => s.group === "B").length).toFixed(1) : 0 },
    { metric: "Self-efficacy", "Group A": data.surveys.filter((s) => s.group === "A").length ? +(data.surveys.filter((s) => s.group === "A").reduce((a, s) => a + s.selfEfficacy, 0) / data.surveys.filter((s) => s.group === "A").length).toFixed(1) : 0, "Group B": data.surveys.filter((s) => s.group === "B").length ? +(data.surveys.filter((s) => s.group === "B").reduce((a, s) => a + s.selfEfficacy, 0) / data.surveys.filter((s) => s.group === "B").length).toFixed(1) : 0 },
  ];

  const handleAdd = () => {
    if (!newIds.trim()) return;
    if (addMode === "single") { data.bulkAdd([newIds.trim()], newGrade || null); }
    else { data.bulkAdd(newIds.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean), newGrade || null); }
    setNewIds(""); setNewGrade("");
  };

  const filteredStu = filter === "all" ? data.students : data.students.filter((s) => s.group === filter);

  return (
    <div className="min-h-screen bg-gray-100 font-game">
      <link href={FONT_URL} rel="stylesheet" /><GlobalStyles />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-5 py-4 text-white flex flex-wrap justify-between items-center gap-2.5">
        <div>
          <h1 className="text-xl font-extrabold m-0">🧠 Memory Game — Admin</h1>
          <p className="text-xs opacity-60 mt-0.5">
            🔥 Firebase • {data.students.length} students • {data.subs.length} submissions • {data.surveys.length} feedback
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Btn onClick={() => navigate("/")} c={P.green} sm>🎮 Game</Btn>
          <Btn onClick={data.exportCSV} c={P.blue} sm dis={data.subs.length === 0}>⬇️ CSV</Btn>
          <Btn
            onClick={async () => {
              if (!window.confirm("Clear ALL data from Firebase (students, submissions, surveys)? This cannot be undone.")) return;
              setClearing(true);
              try {
                const r = await clearAllFirestoreData();
                window.alert(`Cleared: ${r.students} students, ${r.submissions} submissions, ${r.surveys} surveys.`);
              } catch (e) {
                window.alert("Error: " + (e instanceof Error ? e.message : String(e)));
              } finally {
                setClearing(false);
              }
            }}
            c={P.red}
            sm
            dis={clearing}
          >
            {clearing ? "Clearing…" : "🗑️ Clear all"}
          </Btn>
          <Btn onClick={onLogout} c={P.slate} sm>Log out</Btn>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2.5 px-5 py-4 flex-wrap">
        {[
          { l: "Students", v: stats.total, className: "bg-purple-light rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-purple", labelClass: "text-[10px] font-bold text-purple opacity-70", subClass: "text-[9px] text-purple opacity-60 mt-0.5" },
          { l: "No Feedback", sub: "Group A", v: stats.grpA, className: "bg-indigo-100 rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-indigo-700", labelClass: "text-[10px] font-bold text-indigo-700 opacity-70", subClass: "text-[9px] text-indigo-700 opacity-60 mt-0.5" },
          { l: "With Feedback", sub: "Group B", v: stats.grpB, className: "bg-pink-light rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-pink", labelClass: "text-[10px] font-bold text-pink opacity-70", subClass: "text-[9px] text-pink opacity-60 mt-0.5" },
          { l: "Completed", v: stats.done, className: "bg-green-light rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-green", labelClass: "text-[10px] font-bold text-green opacity-70", subClass: "" },
          { l: "No Feedback (A)", sub: "Accuracy (No Feedback)", v: `${stats.accA}%`, className: "bg-indigo-100 rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-indigo-700", labelClass: "text-[10px] font-bold text-indigo-700 opacity-70", subClass: "text-[9px] text-indigo-700 opacity-60 mt-0.5" },
          { l: "With Feedback (B)", sub: "Accuracy (With Feedback)", v: `${stats.accB}%`, className: "bg-pink-light rounded-2xl px-3.5 py-3 text-center flex-1 min-w-[90px]", valueClass: "text-2xl font-black text-pink", labelClass: "text-[10px] font-bold text-pink opacity-70", subClass: "text-[9px] text-pink opacity-60 mt-0.5" },
        ].map((s) => (
          <div key={s.l} className={s.className} title={"sub" in s ? (s as { sub?: string }).sub : undefined}>
            <div className={s.valueClass}>{s.v}</div>
            <div className={s.labelClass}>{s.l}</div>
            {"sub" in s && s.sub && <div className={s.subClass}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-0.5">
        {[["overview", "📊 Charts"], ["students", "👥 Students"], ["data", "📋 Data"], ["feedback", "📝 Feedback"]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 px-4 rounded-t-xl border-none text-sm font-bold cursor-pointer font-game transition-colors ${tab === t ? "bg-white text-purple border-b-[3px] border-purple" : "bg-gray-100 text-slate-light border-b-[3px] border-transparent"}`}>{l}</button>
        ))}
      </div>

      <div className="mx-5 mb-5 bg-white rounded-b-[14px] rounded-tr-[14px] rounded-tl-none p-5 min-h-[350px] shadow-sm">

        {/* OVERVIEW */}
        {tab === "overview" && (
          data.subs.length === 0 ? (
            <div className="text-center py-10 px-5 text-slate-light">
              <div className="text-5xl mb-2.5">📭</div>
              <p className="text-base font-bold">No data yet</p>
              <p className="text-sm">Have students play to see charts.</p>
              <Btn onClick={() => navigate("/")} c={P.green} sm className="mt-4">🎮 Launch Game</Btn>
            </div>
          ) : (
            <>
              <div className="mb-3.5 py-2.5 px-3.5 bg-slate-100 rounded-[10px] text-xs text-slate font-semibold">
                <strong>Groups:</strong> No Feedback (Group A) · With Feedback (Group B) · <strong>Acc. A / Acc. B</strong> = % of correct answers in each group.
              </div>
              <div className="grid grid-cols-4 gap-[18px] min-w-0">
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-extrabold text-slate mb-3">📈 Accuracy by Round (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={accByRound} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="round" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontFamily: ff, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="Group A" name="No Feedback" fill={CHART_COLORS.A} radius={[5, 5, 0, 0]} />
                    <Bar dataKey="Group B" name="With Feedback" fill={CHART_COLORS.B} radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-extrabold text-slate mb-3">⚡ Avg Speed by Round (s)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={speedByRound}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="round" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontFamily: ff, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Line type="monotone" dataKey="Group A" name="No Feedback" stroke={CHART_COLORS.A} strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Group B" name="With Feedback" stroke={CHART_COLORS.B} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-extrabold text-slate mb-3">📊 Overall accuracy (%)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={overallAccData} layout="vertical" margin={{ left: 20 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontFamily: ff, fontSize: 12 }} />
                    <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 5, 5, 0]}>{overallAccData.map((_, i) => <Cell key={i} fill={overallAccData[i].fill} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-extrabold text-slate mb-3">⏱️ Timeouts by round</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={timeoutsByRound} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="round" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, fontFamily: ff, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Bar dataKey="Group A" name="No Feedback" fill={CHART_COLORS.A} radius={[5, 5, 0, 0]} />
                    <Bar dataKey="Group B" name="With Feedback" fill={CHART_COLORS.B} radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                <h3 className="text-sm font-extrabold text-slate mb-3">👥 Session Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }: any) => `${name}: ${value}`} style={{ fontSize: 11, fontWeight: 700 }}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </div>
              {allSubs.length > 0 && outcomeData.length > 0 && (
                <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                  <h3 className="text-sm font-extrabold text-slate mb-3">🎯 Answer outcomes</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart><Pie data={outcomeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}`} style={{ fontSize: 11, fontWeight: 700 }}>
                      {outcomeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie><Tooltip /></PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {data.surveys.length > 0 && (
                <div className="bg-[#FAFAFA] rounded-2xl p-4 border border-gray-200">
                  <h3 className="text-sm font-extrabold text-slate mb-3">📝 Survey (avg 1–4)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={surveyByGroup} barGap={4} margin={{ top: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontFamily: ff, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                      <Bar dataKey="Group A" name="No Feedback" fill={CHART_COLORS.A} radius={[5, 5, 0, 0]} />
                      <Bar dataKey="Group B" name="With Feedback" fill={CHART_COLORS.B} radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              </div>
            </>
          )
        )}

        {/* STUDENTS */}
        {tab === "students" && (
          <div>
            <div className="bg-gray-50 rounded-[14px] p-4 mb-[18px] border-2 border-gray-200">
              <div className="flex justify-between items-center mb-2.5 flex-wrap gap-1.5">
                <h3 className="text-sm font-extrabold text-slate m-0">➕ Register Students</h3>
                <div className="flex gap-1">
                  {["single", "bulk"].map((m) => (
                    <button key={m} onClick={() => setAddMode(m)} className={`py-1.5 px-3 rounded-lg border-2 text-[11px] font-bold cursor-pointer font-game capitalize ${addMode === m ? "border-purple bg-purple-light text-purple" : "border-gray-200 bg-white text-slate-light"}`}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 items-end flex-wrap">
                <div className="flex-[3_1_180px] min-w-0">
                  {addMode === "single"
                    ? <input value={newIds} onChange={(e) => setNewIds(e.target.value)} placeholder="e.g. Student name" className="w-full py-2 px-3 rounded-[10px] border-2 border-gray-200 text-[13px] font-game outline-none box-border" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
                    : <textarea value={newIds} onChange={(e) => setNewIds(e.target.value)} placeholder="Name one, Name two&#10;Name three" rows={2} className="w-full py-2 px-3 rounded-[10px] border-2 border-gray-200 text-xs font-game outline-none box-border resize-y" />
                  }
                </div>
                <div className="flex-1 min-w-[50px]">
                  <input value={newGrade} onChange={(e) => setNewGrade(e.target.value)} placeholder="Class" className="w-full py-2 px-3 rounded-[10px] border-2 border-gray-200 text-[13px] font-game outline-none box-border" />
                </div>
                <Btn onClick={handleAdd} c={P.green} sm dis={!newIds.trim()}>Add</Btn>
              </div>
              <p className="text-[10px] text-slate-light mt-1.5 mb-0">🔄 Groups auto-assigned (block randomization per class)</p>
            </div>
            <div className="flex gap-1.5 mb-3">
              {["all", "A", "B"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`py-1.5 px-3.5 rounded-[10px] border-2 text-xs font-bold cursor-pointer font-game ${filter === f ? "border-purple bg-purple-light text-purple" : "border-gray-200 bg-white text-slate-light"}`}>{f === "all" ? `All (${data.students.length})` : f === "A" ? "Group A (No Feedback)" : "Group B (With Feedback)"}</button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead><tr className="border-b-2 border-gray-200 bg-[#FAFAFA]">
                  {["Name", "Age", "Class", "Group", "Status", "Score", ""].map((h) => <th key={h} className="py-2 px-2.5 text-left font-extrabold text-slate text-[11px]">{h}</th>)}
                </tr></thead>
                <tbody>
                  {filteredStu.map((s, i) => {
                    const ss = data.getStudentSubs(s.studentId); const ok = ss.filter((x) => x.isCorrect).length;
                    return (
                      <tr key={s.studentId} className={`border-b border-gray-100 ${i % 2 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                        <td className="py-2 px-2.5 font-bold text-purple">{s.studentId}</td>
                        <td className="py-2 px-2.5">{s.age || "—"}</td>
                        <td className="py-2 px-2.5">{s.grade || "—"}</td>
                        <td className="py-2 px-2.5"><span className={`py-0.5 px-2 rounded-2xl text-[10px] font-extrabold ${s.group === "A" ? "bg-indigo-100 text-indigo-700" : "bg-pink-light text-pink"}`}>{s.group === "A" ? "Group A (No Feedback)" : "Group B (With Feedback)"}</span></td>
                        <td className="py-2 px-2.5"><span className={`py-0.5 px-2 rounded-2xl text-[10px] font-bold ${s.status === "completed" ? "bg-green-light text-green" : s.status === "playing" ? "bg-orange-light text-orange" : "bg-gray-100 text-slate-light"}`}>{s.status === "completed" ? "✅ Done" : s.status === "playing" ? "🎮 Live" : "⏳"}</span></td>
                        <td className="py-2 px-2.5 font-bold">{ss.length ? `${ok}/${ss.length} (${Math.round((ok / ss.length) * 100)}%)` : "—"}</td>
                        <td className="py-2 px-2.5"><button type="button" onClick={() => data.removeStudent(s.studentId)} className="bg-transparent border-none cursor-pointer text-[11px] font-bold text-red-600 hover:underline">Delete</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DATA */}
        {tab === "data" && (
          data.subs.length === 0 ? (
            <div className="text-center py-10 px-5 text-slate-light">
              <div className="text-5xl mb-2.5">📭</div>
              <p className="text-[15px] font-bold">No submissions yet</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-3.5 flex-wrap gap-2">
                <h3 className="text-[15px] font-extrabold text-slate m-0">📋 {data.subs.length} records</h3>
                <Btn onClick={data.exportCSV} c={P.blue} sm>⬇️ Export CSV</Btn>
              </div>
              <div className="flex gap-3 mb-4 flex-wrap">
                {(["A", "B"] as const).map((g) => {
                  const s = data.getGroupSubs(g); const ok = s.filter((x) => x.isCorrect).length; const avgMs = s.length ? Math.round(s.reduce((a, x) => a + x.responseTimeMs, 0) / s.length) : 0;
                  return (
                    <div key={g} className={`flex-1 min-w-[220px] rounded-[14px] p-3.5 ${g === "A" ? "bg-indigo-100" : "bg-pink-light"}`}>
                      <h4 className={`text-[13px] font-extrabold mb-1.5 ${g === "A" ? "text-indigo-700" : "text-pink"}`}>Group {g} {g === "A" ? "(No Feedback)" : "(With Feedback)"}</h4>
                      <div className="text-xs font-semibold text-slate leading-[1.8]">
                        <div>Accuracy: <strong>{s.length ? Math.round((ok / s.length) * 100) : 0}%</strong></div>
                        <div>Avg Speed: <strong>{(avgMs / 1000).toFixed(1)}s</strong></div>
                        <div>Timeouts: <strong>{s.filter((x) => x.isTimeout).length}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-light mb-2"><strong>Grp:</strong> A = No Feedback, B = With Feedback · <strong>✓</strong> = correct, <strong>⏰</strong> = timeout</p>
              <div className="overflow-x-auto max-h-[340px] border border-gray-200 rounded-[10px]">
                <table className="w-full border-collapse text-[11px]">
                  <thead className="sticky top-0 bg-[#FAFAFA] z-10">
                    <tr className="border-b-2 border-gray-200">
                      {["Student", "Grp", "Round", "Question", "Correct", "Selected", "✓", "⏰", "Time"].map((h) => <th key={h} className="py-1.5 px-2 text-left font-extrabold text-[10px]">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.subs.map((s, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                        <td className="py-1 px-2 font-bold text-purple">{s.studentId}</td>
                        <td className="py-1 px-2"><span className={`py-0.5 px-1.5 rounded-md text-[9px] font-extrabold ${s.group === "A" ? "bg-indigo-100" : "bg-pink-light"}`} title={s.group === "A" ? "No Feedback" : "With Feedback"}>{s.group === "A" ? "Group A (No Feedback)" : "Group B (With Feedback)"}</span></td>
                        <td className="py-1 px-2">{s.round}</td>
                        <td className="py-1 px-2">{s.questionIndex + 1}</td>
                        <td className="py-1 px-2">{s.correctAnswer}</td>
                        <td className="py-1 px-2">{s.selectedAnswer || "—"}</td>
                        <td className="py-1 px-2">{s.isCorrect ? "✅" : "❌"}</td>
                        <td className="py-1 px-2">{s.isTimeout ? "⏰" : "—"}</td>
                        <td className="py-1 px-2">{(s.responseTimeMs / 1000).toFixed(1)}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* FEEDBACK (student survey responses) */}
        {tab === "feedback" && (
          <div>
            <h3 className="text-[15px] font-extrabold text-slate mb-3.5">📝 Student feedback</h3>
            <p className="text-xs text-slate-light mb-3.5">Responses from “One more thing!” survey (Did you have fun? Would you play again? Feel good about your answers?)</p>
            {data.surveys.length === 0 ? (
              <div className="text-center py-8 px-5 text-slate-light">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm font-bold">No feedback yet</p>
                <p className="text-xs">Students will appear here after they complete the game and survey.</p>
              </div>
            ) : (
              <>
                <div className="flex gap-3 mb-4 flex-wrap">
                  {(["A", "B"] as const).map((g) => {
                    const gSurveys = data.surveys.filter((s) => s.group === g);
                    const avgEnjoy = gSurveys.length ? (gSurveys.reduce((a, s) => a + s.enjoyment, 0) / gSurveys.length).toFixed(1) : "—";
                    const avgPlay = gSurveys.length ? (gSurveys.reduce((a, s) => a + s.playAgain, 0) / gSurveys.length).toFixed(1) : "—";
                    const avgEff = gSurveys.length ? (gSurveys.reduce((a, s) => a + s.selfEfficacy, 0) / gSurveys.length).toFixed(1) : "—";
                    return (
                      <div key={g} className={`flex-1 min-w-[200px] rounded-[14px] p-3.5 ${g === "A" ? "bg-indigo-100" : "bg-pink-light"}`}>
                        <h4 className={`text-[13px] font-extrabold mb-1.5 ${g === "A" ? "text-indigo-700" : "text-pink"}`}>Group {g} {g === "A" ? "(No Feedback)" : "(With Feedback)"} — {gSurveys.length} response{gSurveys.length !== 1 ? "s" : ""}</h4>
                        <div className="text-[11px] font-semibold text-slate leading-[1.7]">
                          <div>Avg “Have fun?”: <strong>{avgEnjoy}</strong> (1=No → 4=A lot!)</div>
                          <div>Avg “Play again?”: <strong>{avgPlay}</strong></div>
                          <div>Avg “Feel good?”: <strong>{avgEff}</strong></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="overflow-x-auto border border-gray-200 rounded-[10px]">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-[#FAFAFA]">
                      <tr className="border-b-2 border-gray-200">
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Student</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Group</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Did you have fun?</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Would you play again?</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Feel good about answers?</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Session</th>
                        <th className="py-2 px-2.5 text-left font-extrabold text-[11px]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.surveys.map((sv, i) => {
                        const label = (v: number) => (v === 1 ? "No" : v === 2 ? "A little" : v === 3 ? "Yes!" : "A lot!");
                        const date = sv.timestamp ? new Date(sv.timestamp).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—";
                        const dur = sv.totalSessionDurationMs != null ? `${(sv.totalSessionDurationMs / 60000).toFixed(1)} min` : "—";
                        return (
                          <tr key={i} className={`border-b border-gray-100 ${i % 2 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                            <td className="py-2 px-2.5 font-bold text-purple">{sv.studentId}</td>
                            <td className="py-2 px-2.5"><span className={`py-0.5 px-2 rounded-md text-[10px] font-extrabold ${sv.group === "A" ? "bg-indigo-100" : "bg-pink-light"}`}>{sv.group}</span></td>
                            <td className="py-2 px-2.5">{label(sv.enjoyment)}</td>
                            <td className="py-2 px-2.5">{label(sv.playAgain)}</td>
                            <td className="py-2 px-2.5">{label(sv.selfEfficacy)}</td>
                            <td className="py-2 px-2.5">{dur}</td>
                            <td className="py-2 px-2.5 text-[11px]">{date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================================
// 🔥 FIREBASE REQUIRED (no mock — live data only)
// ================================================================

function FirebaseRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700 p-6 font-game text-white text-center">
      <div className="max-w-[420px]">
        <div className="text-[56px] mb-4">🔥</div>
        <h1 className="text-[22px] font-extrabold mb-3">Firebase required</h1>
        <p className="text-[15px] opacity-90 m-0 leading-[1.5]">
          This app uses live data only. Add your Firebase config in <code className="bg-white/15 py-0.5 px-2 rounded-md">src/firebase/config.ts</code> to run the game.
        </p>
      </div>
    </div>
  );
}

// ================================================================
// 🏠 APP ROOT
// ================================================================

export default function App() {
  if (!isFirebaseConfigured()) {
    return <FirebaseRequired />;
  }
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/admin" element={<AdminGate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DataProvider>
  );
}
