import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Brain,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  LineChart,
  List,
  Menu,
  Play,
  Plus,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Waves
} from "lucide-react";
import "./styles.css";

const AS = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const workouts = [
  {
    day: "Mon",
    title: "Lower body + core",
    focus: "Strength build",
    duration: "58 min",
    exercises: [
      { name: "Leg Press", station: "Leg press station", sets: 4, reps: "8-10", load: "92 kg", img: "leg-press.png", mode: "Guided", note: "Drive through the middle of the foot and keep the knees tracking forward." },
      { name: "Hamstring Curl", station: "Hamstring curl station", sets: 3, reps: "10-12", load: "42 kg", img: "pull.png", mode: "Guided", note: "Control the return and keep your hips heavy on the pad." },
      { name: "Cable Crunch", station: "Cable station", sets: 3, reps: "12", load: "31 kg", img: "chest-press.png", mode: "Manual", note: "Log each round so the plan keeps your core progression accurate." }
    ]
  },
  { day: "Wed", title: "Push + mobility", focus: "Chest, shoulders, mobility", duration: "52 min", exercises: [] },
  { day: "Fri", title: "Pull + conditioning", focus: "Back, arms, endurance", duration: "61 min", exercises: [] }
];

const tabs = [
  ["home", "HOME", Home],
  ["challenges", "CHALLENGES", Trophy],
  ["training", "TRAINING", Dumbbell],
  ["coach", "COACH", Brain],
  ["progress", "PROGRESS", LineChart]
];

function App() {
  const [route, setRoute] = useState("home");
  const [tab, setTab] = useState("home");
  const [hasPlan, setHasPlan] = useState(true);

  const navigate = (next, nextTab = tab) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRoute(next);
    setTab(nextTab);
  };

  let screen = <HomeScreen navigate={navigate} />;
  if (route === "onboarding") screen = <OnboardingScreen navigate={navigate} setHasPlan={setHasPlan} />;
  if (route === "workout") screen = <WorkoutReview navigate={navigate} />;
  if (route === "gym") screen = <GymMode navigate={navigate} />;
  if (tab === "training" && route === "tab") screen = <TrainingScreen navigate={navigate} hasPlan={hasPlan} />;
  if (tab === "coach" && route === "tab") screen = <CoachScreen navigate={navigate} />;
  if (tab === "progress" && route === "tab") screen = <ProgressScreen navigate={navigate} />;
  if (tab === "challenges" && route === "tab") screen = <ChallengeScreen navigate={navigate} />;

  return (
    <main className="page-shell">
      <div className="phone-frame">
        <div className="dynamic-island" />
        <div className="app-root">
          <div key={`${route}-${tab}`} className="route-stage">
            {screen}
          </div>
          {route !== "onboarding" && route !== "gym" && (
            <TabBar tab={tab} setTab={(id) => { setTab(id); navigate("tab", id); }} />
          )}
        </div>
      </div>
    </main>
  );
}

function Logo({ compact = false }) {
  return (
    <div className={compact ? "logo compact" : "logo"}>
      <div className="logo-mark">
        <span className="ring r1" />
        <span className="ring r2" />
        <Dumbbell size={compact ? 18 : 22} />
        <i />
      </div>
      <div className="logo-text">
        <b>AI BODY</b>
        <span>TRAINER</span>
      </div>
    </div>
  );
}

function Shell({ title, subtitle, children, navigate }) {
  return (
    <section className="screen">
      <header className="hero-header">
        <div className="top-actions">
          <button className="avatar" aria-label="Profile"><UserRound /></button>
          <button className="add" onClick={() => navigate("onboarding")} aria-label="Add"><Plus /></button>
        </div>
        <div className="hero-title-row">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <Logo />
        </div>
      </header>
      <div className="content-panel">
        <div className="content-stack">{children}</div>
      </div>
    </section>
  );
}

function HomeScreen({ navigate }) {
  return (
    <Shell title="Hi, Peter!" subtitle="Your adaptive training plan is ready." navigate={navigate}>
      <button className="scan-entry reveal" onClick={() => navigate("onboarding")}>
        <span className="scan-orbit o1" />
        <span className="scan-orbit o2" />
        <span className="scan-orbit o3" />
        <span className="badge teal">Scan ready</span>
        <strong>Build a plan from your body</strong>
        <span className="cta-line">Start Smart Body Scan <ChevronRight size={24} /></span>
        <span className="scan-figures"><UserRound /><UserRound /></span>
      </button>

      <section className="card plan-card reveal d1">
        <div className="row between">
          <div>
            <span className="eyebrow">Today</span>
            <h2>Lower body + core</h2>
          </div>
          <span className="pill dark">58 min</span>
        </div>
        <div className="metric-grid">
          <Metric value="3" label="moves today" tone="green" />
          <Metric value="76%" label="first target" tone="teal" />
          <Metric value="13d" label="next scan" tone="gold" />
        </div>
        <button className="primary dark" onClick={() => navigate("workout", "training")}><Play /> Open today's workout <ChevronRight /></button>
      </section>

      <section className="profile-card reveal d2">
        <div className="section-head"><h2>Training profile</h2><button>Edit <ChevronRight /></button></div>
        <div className="profile-top"><Logo compact /><div><b>Smart Body Scan</b><span>Body composition, mobility, and progress signal</span></div></div>
        <div className="profile-body">
          <h3>Training baseline</h3>
          <p>3 days/week · 50-60 min · strength focus</p>
          <b>Next scan in 13 days</b>
        </div>
      </section>

      <section className="horizontal reveal d3">
        <div className="section-head"><h2>How it works</h2></div>
        <div className="rail">
          <Feature title="Scan" copy="Read your starting point" img="smartphone.jpeg" />
          <Feature title="Plan" copy="Build the week" img="app-hero.jpeg" />
          <Feature title="Coach" copy="Guide every set" />
        </div>
      </section>
    </Shell>
  );
}

function OnboardingScreen({ navigate, setHasPlan }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(12);
  const [goals, setGoals] = useState(["Gain muscle"]);
  const [injuries, setInjuries] = useState(["No injuries"]);
  const [days, setDays] = useState(["Mon", "Wed", "Fri"]);
  const [buildStage, setBuildStage] = useState(-1);
  const planRef = useRef(null);
  const bottomRef = useRef(null);
  const stages = ["Reading body scan data", "Matching goals with injury notes", "Choosing guided exercises", "Building your first week"];

  useEffect(() => {
    if (step !== 4) return;
    setBuildStage(-1);
    const timers = [900, 2200, 3500, 4800, 6100].map((time, idx) =>
      setTimeout(() => idx < stages.length ? setBuildStage(idx) : setStep(5), time)
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const startScan = () => {
    let current = 12;
    const timer = setInterval(() => {
      current += 18;
      setProgress(Math.min(current, 100));
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => setStep(1), 250);
      }
    }, 230);
  };

  const openWorkout = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setTimeout(() => { setHasPlan(true); navigate("workout", "training"); }, 780);
  };

  return (
    <section className="onboarding">
      <div className="onboard-top">
        <button onClick={() => step ? setStep(step - 1) : navigate("home")}><ArrowLeft /></button>
        <Dots step={step} total={6} />
        <Logo compact />
      </div>
      <div className="onboard-scroll" ref={planRef}>
        {step === 0 && (
          <div className="onboard-stack">
            <Title eyebrow="AI Body Trainer" title="Start with your Smart Body Scan" />
            <ScanVisual progress={progress} active={progress > 12 && progress < 100} />
            <div className="glass metrics3">
              <Metric value="81" label="Body" />
              <Metric value="82" label="Mobility" />
              <Metric value="76%" label="Progress" />
            </div>
          </div>
        )}
        {step === 1 && (
          <ChoiceScreen
            eyebrow="Goals"
            title="What are we training for?"
            copy="Pick the goals you want your coach to prioritise."
            options={["Gain muscle", "Lose body fat", "Increase strength", "Improve cardio", "Boost energy", "Improve mobility"]}
            selected={goals}
            toggle={(x) => setGoals((g) => g.includes(x) ? g.filter(v => v !== x) : [...g, x])}
          />
        )}
        {step === 2 && (
          <ChoiceScreen
            eyebrow="Limitations"
            title="Anything to protect?"
            copy="Your AI Trainer uses this before programming load."
            options={["No injuries", "Lower back", "Shoulder", "Knee", "Ankle", "Neck", "Elbow", "Limited range"]}
            selected={injuries}
            grid
            toggle={(x) => setInjuries(x === "No injuries" ? ["No injuries"] : injuries.includes(x) ? injuries.filter(v => v !== x) : [...injuries.filter(v => v !== "No injuries"), x])}
          />
        )}
        {step === 3 && (
          <div className="onboard-stack">
            <Title eyebrow="Schedule" title="Build around your week" copy="Choose realistic training days. The plan adapts volume and recovery around them." />
            <div className="day-picker">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <button key={d} className={days.includes(d) ? "active" : ""} onClick={() => setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d])}>{d[0]}<i /></button>)}</div>
            <div className="glass checklist">
              {["Guided exercises", "Fast set logging", "Progress memory"].map((x) => <p key={x}><CheckCircle2 /> <b>{x}</b><span>Clear targets, saved sets, and notes stay attached to the plan.</span></p>)}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="build-screen">
            <ThinkingOrb />
            <Title eyebrow="" title="Building your training" copy={buildStage < 0 ? "Starting the AI trainer and preparing your body scan data." : stages[Math.min(buildStage, stages.length - 1)]} center />
            <div className="stage-list">
              {stages.map((s, i) => <div key={s} className={i <= buildStage ? "done stage" : "stage"} style={{ "--i": i }}><span>{i < buildStage ? <Check /> : <Sparkles />}</span><div><b>{s}</b><small>{i < buildStage ? "Complete" : i === buildStage ? "In progress" : "Queued"}</small></div></div>)}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="plan-ready">
            <div className="ready-top">
              <Title eyebrow="Your first week is ready" title="Your AI training plan is ready." />
              <button className="primary gold" onClick={openWorkout}>Continue to today's workout <ArrowDown /></button>
            </div>
            <TrainingProfile />
            <LogicCard />
            <WorkoutReveal />
            <Consistency />
            <div className="week-list">
              {workouts.map(w => <button key={w.day} onClick={() => navigate("workout", "training")}><b>{w.day}</b><span>{w.title}<small>{w.duration} · {w.focus}</small></span><ChevronRight /></button>)}
            </div>
            <div ref={bottomRef} className="bottom-open">
              <h2>Your AI training plan is ready</h2>
              <button className="primary green" onClick={openWorkout}>Open today's workout <ChevronRight /></button>
            </div>
          </div>
        )}
      </div>
      {step < 4 && <div className="onboard-actions"><button className="primary gold" onClick={step === 0 ? startScan : () => setStep(step + 1)}>{step === 0 ? "Start Smart Body Scan" : step === 3 ? "Create my training plan" : "Continue"} <ArrowRight /></button></div>}
    </section>
  );
}

function WorkoutReview({ navigate }) {
  const session = workouts[0];
  return (
    <section className="review screen light">
      <div className="review-head"><button onClick={() => navigate("home")}><ArrowLeft /></button><Logo compact /></div>
      <div className="content-stack pad">
        <section className="card">
          <span className="badge teal">Ready</span>
          <h1>{session.title}</h1>
          <p>Monday · {session.duration} · {session.focus}</p>
          <div className="metric-grid"><Metric value="3" label="exercises" /><Metric value="92%" label="plan match" /><Metric value="3" label="target days" /></div>
        </section>
        <section className="start-card">
          <span className="badge dark">Gym mode</span>
          <h2>Start training</h2>
          <p>Large controls, set logging, rest timing, and your full plan in one view.</p>
          <button className="primary gold" onClick={() => navigate("gym", "training")}><Play /> Start your training <ChevronRight /></button>
        </section>
        <section className="card">
          <h2>Your workout is ready</h2>
          <p>As you complete each set, the app keeps the next action obvious, saves your load and reps, then turns the session into progression signals.</p>
          <div className="data-bars">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ height: 9 + (i % 5) * 5 }} />)}</div>
        </section>
        <h2 className="section-title">Workout plan</h2>
        {session.exercises.map((ex, idx) => <ExerciseRow key={ex.name} ex={ex} idx={idx} />)}
      </div>
    </section>
  );
}

function GymMode({ navigate }) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [set, setSet] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [panel, setPanel] = useState(null);
  const ex = workouts[0].exercises[exerciseIndex];

  useEffect(() => {
    const id = setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const advance = () => {
    if (set < ex.sets) setSet(set + 1);
    else if (exerciseIndex < workouts[0].exercises.length - 1) { setExerciseIndex(exerciseIndex + 1); setSet(1); }
    else navigate("workout", "training");
  };

  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return (
    <section className="gym">
      <header className="gym-top"><button onClick={() => navigate("workout", "training")}><ArrowLeft /></button><h1>Gym mode</h1><button onClick={() => setPanel("Workout plan")}><Menu /></button></header>
      <main className="gym-main">
        <div className="gym-summary">
          <div><span className="badge green">Set guidance active</span><h2>{ex.name}</h2><p>{ex.station} · Exercise {exerciseIndex + 1} of 3</p></div>
          <div className="timer">{time}<span>active</span></div>
        </div>
        <section key={`${ex.name}-${set}`} className="exercise-stage active-stage">
          <span className="stage-scan-path" />
          <div className="row between"><div><h3>Set {set}</h3><b>{ex.reps} x {ex.load}</b></div><ProgressRing done={set - 1} total={ex.sets} /></div>
          <div className="exercise-media"><img src={AS(ex.img)} alt="" /></div>
          <p>{ex.note}</p>
        </section>
        <div className="set-row">{Array.from({ length: ex.sets }).map((_, i) => <span key={i} className={i + 1 < set ? "done" : i + 1 === set ? "active" : ""}>{i + 1 < set ? <Check /> : i + 1}</span>)}</div>
        <div className="gym-panels">{["Plan", "Stats", "Coach", "Setup", "Notes"].map(x => <button key={x} onClick={() => setPanel(x)}>{x}</button>)}</div>
        <button className="primary gold big" onClick={advance}>{set === ex.sets ? (exerciseIndex === 2 ? "Finish workout" : "Next exercise") : "Save and continue"} <ChevronRight /></button>
      </main>
      {panel && <div className="sheet" onClick={() => setPanel(null)}><div onClick={(e) => e.stopPropagation()}><h2>{panel}</h2><p>{panel === "Workout plan" || panel === "Plan" ? "Leg Press, Hamstring Curl, Cable Crunch. The current exercise remains highlighted while you train." : "This panel keeps secondary details available without cluttering gym mode."}</p><button className="primary dark" onClick={() => setPanel(null)}>Close</button></div></div>}
    </section>
  );
}

function TrainingScreen({ navigate }) {
  return <Shell title="Training" subtitle="Your AI plan, set logs, and next workout." navigate={navigate}><Feature title="AI Body Trainer" copy="Your plan is ready for the next workout." img="training-plan.jpeg" onClick={() => navigate("onboarding")} /><button onClick={() => navigate("workout", "training")} className="plain-session"><PlanRow session={workouts[0]} /></button>{workouts.map(w => <PlanRow key={w.day} session={w} />)}</Shell>;
}

function CoachScreen({ navigate }) {
  return <Shell title="AI Coach" subtitle="Smart Body Scan, adaptive workouts, and progress guidance." navigate={navigate}><button className="scan-entry tall" onClick={() => navigate("onboarding")}><span className="badge teal">Body Scan</span><strong>Start your adaptive plan</strong><span>Smart Body Scan, goals, and guided training.</span></button><PlanRow session={workouts[0]} /></Shell>;
}

function ProgressScreen({ navigate }) {
  return <Shell title="Progress" subtitle="Smart Body Scan, body metrics, and progress toward your first target." navigate={navigate}><Feature title="Body scan progress" copy="Body composition, mobility, and goal distance in one timeline." img="smartphone.jpeg" /><div className="metric-grid"><Metric value="81" label="Body score" /><Metric value="76%" label="First target" /><Metric value="9" label="Streak" /><Metric value="92" label="Plan match" /></div><Consistency light /></Shell>;
}

function ChallengeScreen({ navigate }) {
  return <Shell title="Challenges" subtitle="Train with friends and share challenge progress." navigate={navigate}><Feature title="Invite friends" copy="Train together and share AI plan progress." img="app-hero.jpeg" /><Feature title="AI Trainer Challenge" copy="Weekly goals, logs, and smart points." img="training-plan.jpeg" /></Shell>;
}

function TabBar({ tab, setTab }) {
  return <nav className="tabs">{tabs.map(([id, label, Icon]) => <button key={id} onClick={() => setTab(id)} className={tab === id ? "active" : ""}><Icon /><span>{label}</span></button>)}</nav>;
}

function Metric({ value, label, tone = "" }) { return <div className={`metric ${tone}`}><b>{value}</b><span>{label}</span></div>; }
function Title({ eyebrow, title, copy, center }) { return <div className={center ? "title center" : "title"}>{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1>{copy && <p>{copy}</p>}</div>; }
function Dots({ step, total }) { return <div className="dots">{Array.from({ length: total }).map((_, i) => <i key={i} className={i <= step ? "active" : ""} />)}</div>; }
function Feature({ title, copy, img, onClick }) { const C = onClick ? "button" : "div"; return <C className="feature" onClick={onClick}>{img && <img src={AS(img)} alt="" />}<div><span className="badge gold">{title}</span><h3>{title}</h3><p>{copy}</p></div></C>; }
function PlanRow({ session }) { return <div className="plan-row"><b>{session.day}</b><span>{session.title}<small>{session.duration} · {session.focus}</small></span><ChevronRight /></div>; }
function ProgressRing({ done, total }) { return <div className="progress-ring" style={{ "--p": `${(done / total) * 360}deg` }}><span>{done}/{total}</span></div>; }

function ScanVisual({ progress, active }) {
  return (
    <div className="scan-visual">
      <span className="scan-beam" />
      <span className="scan-pulse p1" />
      <span className="scan-pulse p2" />
      {Array.from({ length: 8 }).map((_, i) => <i key={i} className="scan-dot" style={{ "--i": i }} />)}
      <span className={active ? "scan-line active" : "scan-line"} />
      <div className="scan-rings" />
      <div className="scan-circle" style={{ "--progress": `${progress}%` }}><Activity size={76} /></div>
      <b>{active ? "Reading scan data" : "Ready to start scan"}</b>
    </div>
  );
}

function ChoiceScreen({ eyebrow, title, copy, options, selected, toggle, grid }) {
  return <div className="onboard-stack"><Title eyebrow={eyebrow} title={title} copy={copy} /><div className={grid ? "choice-grid" : "choice-list"}>{options.map((x, i) => <button key={x} style={{ "--i": i }} className={selected.includes(x) ? "selected" : ""} onClick={() => toggle(x)}><span>{selected.includes(x) ? <CheckCircle2 /> : <Circle />}</span><b>{x}</b></button>)}</div></div>;
}

function ThinkingOrb() {
  return (
    <div className="thinking">
      <span className="halo h1" />
      <span className="halo h2" />
      <span className="halo h3" />
      {Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}
      <div className="thinking-core">
        <Logo compact />
        <em />
        <em />
        <em />
      </div>
    </div>
  );
}
function TrainingProfile() { return <section className="dark-card"><span className="badge gold">Training profile</span><h2>Strength Balance</h2><p>Strength first, with mobility between heavier days.</p><div className="metric-grid"><Metric value="3 days" label="training" /><Metric value="2 weeks" label="next scan" /><Metric value="Plan" label="guided loads" /></div></section>; }
function LogicCard() { return <section className="glass logic"><h2>How the plan was built</h2><div><Metric value="Scan" label="Body composition" /><Metric value="Goal" label="Strength priority" /><Metric value="Plan" label="guided loads" /></div></section>; }
function WorkoutReveal() { return <section className="dark-card"><span className="badge teal">Ready</span><h2>Lower body + core</h2><p>Monday · 58 min · Strength build</p><div className="data-bars">{Array.from({ length: 18 }).map((_, i) => <i key={i} />)}</div></section>; }
function Consistency() { return <section className="dark-card consistency"><span className="badge teal">Goal progress</span><h2>First target path</h2><p>76% based on consistency, scan changes, and completed sets.</p><div className="weeks">{[0,1,2,3].map(w => <div key={w}><b>W{w+1}</b>{[0,1,2,3,4,5,6].map((d) => <i key={d} className={(d + w) % 3 === 0 ? "done" : d > 4 && w === 3 ? "scan" : ""} />)}</div>)}</div></section>; }
function ExerciseRow({ ex }) { return <section className="exercise-row"><img src={AS(ex.img)} alt="" /><div><h3>{ex.name}</h3><p>{ex.station}</p><div className="chips"><span>{ex.sets} sets</span><span>{ex.reps}</span><span>{ex.load}</span><span>{ex.mode}</span></div><p>{ex.note}</p></div></section>; }

createRoot(document.getElementById("root")).render(<App />);
