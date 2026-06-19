import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Dumbbell,
  Home,
  LineChart,
  Menu,
  Play,
  Plus,
  Sparkles,
  Trophy,
  UserRound
} from "lucide-react";
import { demoMode, exchangeMagicToken, hasApi, loadWorkoutSession, postWorkoutEvent, submitOnboarding } from "./api.js";
import { fixtureSession, weekSessions } from "./fixture.js";
import "./styles.css";

const AS = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const tabs = [
  ["home", "HOME", Home],
  ["challenges", "CHALLENGES", Trophy],
  ["training", "TRAINING", Dumbbell],
  ["coach", "COACH", Brain],
  ["progress", "PROGRESS", LineChart]
];

function readInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const match = window.location.pathname.match(/\/(workout|onboarding)\/([^/?#]+)/);
  if (!match) return { route: "home", tab: "home", token };
  return { route: match[1], id: match[2], tab: match[1] === "workout" ? "training" : "home", token };
}

function removeTokenFromUrl() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("token")) return;
  url.searchParams.delete("token");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function App() {
  const initial = useMemo(readInitialRoute, []);
  const apiRequired = initial.route === "workout" || initial.route === "onboarding";
  const [route, setRoute] = useState(initial.route);
  const [tab, setTab] = useState(initial.tab);
  const [session, setSession] = useState(fixtureSession);
  const [loadState, setLoadState] = useState(!hasApi && apiRequired && !demoMode ? "error" : hasApi && initial.route === "workout" ? "loading" : "ready");
  const [error, setError] = useState(!hasApi && apiRequired && !demoMode ? new Error("API base URL is not configured") : null);

  useEffect(() => {
    if (initial.route !== "workout" || !hasApi) return;
    let active = true;
    (async () => {
      try {
        if (initial.token) {
          await exchangeMagicToken({ token: initial.token, sessionId: initial.id });
          removeTokenFromUrl();
        }
        const next = await loadWorkoutSession(initial.id);
        if (!active) return;
        setSession(next);
        setLoadState("ready");
        postWorkoutEvent(next.session_id, "session_opened", { source: "website" })
          .catch((eventError) => console.warn("Could not record session_opened", eventError));
      } catch (err) {
        if (!active) return;
        setError(err);
        setLoadState(err.status === 410 ? "expired" : "error");
      }
    })();
    return () => { active = false; };
  }, [initial]);

  const navigate = (next, nextTab = tab) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setRoute(next);
    setTab(nextTab);
  };

  const updateSessionStatus = (status) => setSession((current) => ({ ...current, status }));

  let screen = <HomeScreen navigate={navigate} session={session} />;
  if (loadState === "loading") screen = <StatusScreen title="Loading your workout" copy="Checking your secure WhatsApp link and loading your plan." />;
  else if (loadState === "expired") screen = <StatusScreen title="Workout link expired" copy="Message your coach on WhatsApp with “Gym” and I’ll send a fresh link." />;
  else if (loadState === "error") screen = <StatusScreen title="Couldn’t open this workout" copy={error?.message || "The session could not be loaded."} />;
  else if (route === "onboarding") screen = <OnboardingScreen navigate={navigate} memberId={initial.id} token={initial.token} setSession={setSession} />;
  else if (route === "workout") screen = <WorkoutReview navigate={navigate} session={session} />;
  else if (route === "gym") screen = <GymMode navigate={navigate} session={session} updateSessionStatus={updateSessionStatus} />;
  else if (tab === "training" && route === "tab") screen = <TrainingScreen navigate={navigate} session={session} />;
  else if (tab === "coach" && route === "tab") screen = <CoachScreen navigate={navigate} session={session} />;
  else if (tab === "progress" && route === "tab") screen = <ProgressScreen navigate={navigate} session={session} />;
  else if (tab === "challenges" && route === "tab") screen = <ChallengeScreen navigate={navigate} />;

  return (
    <main className="page-shell">
      <div className="phone-frame">
        <div className="dynamic-island" />
        <div className="app-root">
          <div key={`${route}-${tab}-${loadState}`} className="route-stage">
            {screen}
          </div>
          {route !== "onboarding" && route !== "gym" && loadState === "ready" && (
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
      <div className="logo-text"><b>AI BODY</b><span>TRAINER</span></div>
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
          <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
          <Logo />
        </div>
      </header>
      <div className="content-panel"><div className="content-stack">{children}</div></div>
    </section>
  );
}

function HomeScreen({ navigate, session }) {
  return (
    <Shell title={`Hi, ${session.member_display_name}!`} subtitle="Your adaptive training plan is ready." navigate={navigate}>
      <button className="scan-entry reveal" onClick={() => navigate("onboarding")}>
        <span className="scan-orbit o1" /><span className="scan-orbit o2" /><span className="scan-orbit o3" />
        <span className="badge teal">Body Scan optional</span>
        <strong>Build a plan from your goals</strong>
        <span className="cta-line">Update training profile <ChevronRight size={24} /></span>
        <span className="scan-figures"><UserRound /><UserRound /></span>
      </button>
      <section className="card plan-card reveal d1">
        <div className="row between"><div><span className="eyebrow">Today</span><h2>{session.title}</h2></div><span className="pill dark">{session.duration_minutes} min</span></div>
        <div className="metric-grid">
          <Metric value={session.metrics.exercise_count} label="moves today" tone="green" />
          <Metric value={`${session.metrics.plan_match_percent}%`} label="plan match" tone="teal" />
          <Metric value={`${session.metrics.target_days_per_week}x`} label="weekly target" tone="gold" />
        </div>
        <button className="primary dark" onClick={() => navigate("workout", "training")}><Play /> Open today's workout <ChevronRight /></button>
      </section>
      <section className="profile-card reveal d2">
        <div className="section-head"><h2>Why this plan</h2><button onClick={() => navigate("workout", "training")}>View <ChevronRight /></button></div>
        <div className="profile-top"><Logo compact /><div><b>{session.focus}</b><span>{session.rationale}</span></div></div>
        <div className="profile-body"><h3>Next scan or check-in</h3><p>Keep the plan honest with a rescan or check-in every 1-2 weeks.</p><b>{session.timezone}</b></div>
      </section>
    </Shell>
  );
}

function OnboardingScreen({ navigate, memberId, token, setSession }) {
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState(["Gain muscle"]);
  const [injuries, setInjuries] = useState(["No injuries"]);
  const [days, setDays] = useState(["Mon", "Wed", "Fri"]);
  const [duration, setDuration] = useState(55);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const stages = ["Matching goals with injury notes", "Checking gym equipment", "Adding warm-up and cool-down", "Building your first week"];

  const finish = async () => {
    setSubmitting(true);
    try {
      if (hasApi && token) {
        await exchangeMagicToken({ token });
        removeTokenFromUrl();
      }
      const result = await submitOnboarding(memberId || fixtureSession.member_id, {
        goals,
        injuries: injuries.includes("No injuries") ? [] : injuries,
        scheduleDays: days,
        sessionDurationMinutes: duration,
        trainingLevel: "beginner",
        equipmentNoGos: [],
        motivationStyle: "direct but supportive",
        timezone: "Europe/Berlin",
        consentAccepted: consent
      });
      if (result.workoutSessionId && hasApi) setSession(await loadWorkoutSession(result.workoutSessionId));
      navigate("workout", "training");
    } catch (err) {
      alert(err.message || "Could not submit onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="onboarding">
      <div className="onboard-top">
        <button onClick={() => step ? setStep(step - 1) : navigate("home")}><ArrowLeft /></button>
        <Dots step={step} total={5} />
        <Logo compact />
      </div>
      <div className="onboard-scroll">
        {step === 0 && (
          <ChoiceScreen eyebrow="Goals" title="What are we training for?" copy="Pick what your coach should prioritize." options={["Gain muscle", "Lose body fat", "Increase strength", "Improve cardio", "Boost energy", "Improve mobility"]} selected={goals} toggle={(x) => setGoals((g) => g.includes(x) ? g.filter(v => v !== x) : [...g, x])} />
        )}
        {step === 1 && (
          <ChoiceScreen eyebrow="Limitations" title="Anything to protect?" copy="The plan uses this before programming load." options={["No injuries", "Lower back", "Shoulder", "Knee", "Ankle", "Neck", "Elbow", "Limited range"]} selected={injuries} grid toggle={(x) => setInjuries(x === "No injuries" ? ["No injuries"] : injuries.includes(x) ? injuries.filter(v => v !== x) : [...injuries.filter(v => v !== "No injuries"), x])} />
        )}
        {step === 2 && (
          <div className="onboard-stack">
            <Title eyebrow="Schedule" title="Build around your week" copy="Choose realistic training days and session length." />
            <div className="day-picker">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <button key={d} className={days.includes(d) ? "active" : ""} onClick={() => setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d])}>{d[0]}<i /></button>)}</div>
            <label className="field-label">Workout length<input type="range" min="30" max="90" step="5" value={duration} onChange={(e) => setDuration(Number(e.target.value))} /><b>{duration} minutes</b></label>
          </div>
        )}
        {step === 3 && (
          <div className="onboard-stack">
            <Title eyebrow="Safety" title="Consent and boundaries" copy="The coach can guide training, but it does not replace medical advice." />
            <label className="consent-row"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I understand and accept the training disclaimer.</label>
            <div className="glass checklist">{["No medical diagnosis", "Stop sharp pain", "Human review for red flags"].map((x) => <p key={x}><CheckCircle2 /> <b>{x}</b><span>The coach becomes conservative when safety risk appears.</span></p>)}</div>
          </div>
        )}
        {step === 4 && (
          <div className="build-screen">
            <ThinkingOrb />
            <Title title={submitting ? "Building your training" : "Ready to build"} copy={submitting ? stages[1] : "Your coach will generate a plan, validate it, and save a private session for you."} center />
            <div className="stage-list">{stages.map((s, i) => <div key={s} className="stage done" style={{ "--i": i }}><span><Sparkles /></span><div><b>{s}</b><small>Queued</small></div></div>)}</div>
          </div>
        )}
      </div>
      <div className="onboard-actions">
        {step < 4 ? <button className="primary gold" onClick={() => setStep(step + 1)}>Continue <ArrowRight /></button> : <button disabled={!consent || submitting} className="primary gold" onClick={finish}>{submitting ? "Creating plan..." : "Create my training plan"} <ArrowRight /></button>}
      </div>
    </section>
  );
}

function WorkoutReview({ navigate, session }) {
  return (
    <section className="review screen light">
      <div className="review-head"><button onClick={() => navigate("home")}><ArrowLeft /></button><Logo compact /></div>
      <div className="content-stack pad">
        <section className="card">
          <span className="badge teal">{session.status}</span>
          <h1>{session.title}</h1>
          <p>{session.duration_minutes} min · {session.focus}</p>
          <div className="metric-grid"><Metric value={session.metrics.exercise_count} label="exercises" /><Metric value={`${session.metrics.plan_match_percent}%`} label="plan match" /><Metric value={session.metrics.target_days_per_week} label="target days" /></div>
        </section>
        <section className="start-card">
          <span className="badge dark">Gym mode</span>
          <h2>Start training</h2>
          <p>Large controls, set logging, rest timing, and your full plan in one view.</p>
          <button className="primary gold" onClick={() => navigate("gym", "training")}><Play /> Start your training <ChevronRight /></button>
        </section>
        <PlanBlock title="Warm-up" items={session.warmup} />
        <section className="card"><h2>Why it is in your plan</h2><p>{session.rationale}</p><div className="data-bars">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ height: 9 + (i % 5) * 5 }} />)}</div></section>
        <h2 className="section-title">Workout plan</h2>
        {session.exercises.map((ex) => <ExerciseRow key={ex.exercise_id} ex={ex} />)}
        <PlanBlock title="Cool-down" items={session.cooldown} />
        <PlanBlock title="Safety notes" items={session.safety_notes} />
      </div>
    </section>
  );
}

function GymMode({ navigate, session, updateSessionStatus }) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [set, setSet] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [panel, setPanel] = useState(null);
  const ex = session.exercises[exerciseIndex];

  useEffect(() => {
    postWorkoutEvent(session.session_id, "session_started", { title: session.title })
      .catch((eventError) => console.warn("Could not record session_started", eventError));
    const id = setInterval(() => setElapsed((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [session.session_id, session.title]);

  const advance = async () => {
    await postWorkoutEvent(session.session_id, "set_completed", { exerciseId: ex.exercise_id, exerciseName: ex.name, set })
      .catch((eventError) => console.warn("Could not record set_completed", eventError));
    if (set < ex.sets) setSet(set + 1);
    else if (exerciseIndex < session.exercises.length - 1) { setExerciseIndex(exerciseIndex + 1); setSet(1); }
    else {
      await postWorkoutEvent(session.session_id, "session_completed", { elapsedSeconds: elapsed })
        .catch((eventError) => console.warn("Could not record session_completed", eventError));
      updateSessionStatus("completed");
      navigate("workout", "training");
    }
  };

  const reportPain = async () => {
    await postWorkoutEvent(session.session_id, "pain_reported", { exerciseId: ex.exercise_id, exerciseName: ex.name })
      .catch((eventError) => console.warn("Could not record pain_reported", eventError));
    setPanel("Pain reported");
  };

  const time = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  return (
    <section className="gym">
      <header className="gym-top"><button onClick={() => navigate("workout", "training")}><ArrowLeft /></button><h1>Gym mode</h1><button onClick={() => setPanel("Workout plan")}><Menu /></button></header>
      <main className="gym-main">
        <div className="gym-summary"><div><span className="badge green">Set guidance active</span><h2>{ex.name}</h2><p>{ex.station} · Exercise {exerciseIndex + 1} of {session.exercises.length}</p></div><div className="timer">{time}<span>active</span></div></div>
        <section key={`${ex.name}-${set}`} className="exercise-stage active-stage">
          <span className="stage-scan-path" />
          <div className="row between"><div><h3>Set {set}</h3><b>{ex.reps} x {ex.load}</b></div><ProgressRing done={set - 1} total={ex.sets} /></div>
          <div className="exercise-media"><img src={assetUrl(ex.image_url)} alt="" /></div>
          <p>{ex.note}</p>
        </section>
        <div className="set-row">{Array.from({ length: ex.sets }).map((_, i) => <span key={i} className={i + 1 < set ? "done" : i + 1 === set ? "active" : ""}>{i + 1 < set ? <Check /> : i + 1}</span>)}</div>
        <div className="gym-panels">{["Plan", "Sub", "Pain", "Notes", "Coach"].map(x => <button key={x} onClick={x === "Pain" ? reportPain : () => setPanel(x)}>{x}</button>)}</div>
        <button className="primary gold big" onClick={advance}>{set === ex.sets ? (exerciseIndex === session.exercises.length - 1 ? "Finish workout" : "Next exercise") : "Save and continue"} <ChevronRight /></button>
      </main>
      {panel && <Sheet title={panel} close={() => setPanel(null)}>{panelCopy(panel, session, ex)}</Sheet>}
    </section>
  );
}

function TrainingScreen({ navigate, session }) {
  return <Shell title="Training" subtitle="Your AI plan, set logs, and next workout." navigate={navigate}><button onClick={() => navigate("workout", "training")} className="plain-session"><PlanRow session={{ day: "Now", title: session.title, duration: `${session.duration_minutes} min`, focus: session.focus }} /></button>{weekSessions.map(w => <PlanRow key={w.day} session={w} />)}</Shell>;
}

function CoachScreen({ navigate, session }) {
  return <Shell title="AI Coach" subtitle="Adaptive workouts, accountability, and progress guidance." navigate={navigate}><button className="scan-entry tall" onClick={() => navigate("onboarding")}><span className="badge teal">Profile</span><strong>Update your adaptive plan</strong><span>Your coach uses goals, limitations, and workout logs.</span></button><PlanRow session={{ day: "Now", title: session.title, duration: `${session.duration_minutes} min`, focus: session.focus }} /></Shell>;
}

function ProgressScreen({ navigate, session }) {
  return <Shell title="Progress" subtitle="Training consistency, completed sets, and next check-in." navigate={navigate}><div className="metric-grid"><Metric value={session.metrics.exercise_count} label="today moves" /><Metric value={`${session.metrics.plan_match_percent}%`} label="plan match" /><Metric value={session.metrics.target_days_per_week} label="weekly target" /></div><Consistency /></Shell>;
}

function ChallengeScreen({ navigate }) {
  return <Shell title="Challenges" subtitle="Train with friends and share challenge progress." navigate={navigate}><Feature title="Invite friends" copy="Train together and share AI plan progress." img="app-hero.jpeg" /><Feature title="AI Trainer Challenge" copy="Weekly goals, logs, and smart points." img="training-plan.jpeg" /></Shell>;
}

function StatusScreen({ title, copy }) {
  return <section className="screen status-screen"><Logo /><div><h1>{title}</h1><p>{copy}</p></div></section>;
}

function PlanBlock({ title, items }) {
  return <section className="card plan-block"><h2>{title}</h2>{items.map((item) => <p key={item}><CheckCircle2 /> <span>{item}</span></p>)}</section>;
}

function Sheet({ title, children, close }) {
  return <div className="sheet" onClick={close}><div onClick={(e) => e.stopPropagation()}><h2>{title}</h2><p>{children}</p><button className="primary dark" onClick={close}>Close</button></div></div>;
}

function panelCopy(panel, session, ex) {
  if (panel === "Workout plan" || panel === "Plan") return session.exercises.map(item => item.name).join(", ");
  if (panel === "Sub") return ex.substitutions[0]?.reason ? `${ex.substitutions[0].name}: ${ex.substitutions[0].reason}` : "Message your coach if this station is blocked.";
  if (panel === "Pain reported") return "Stop this movement. Your coach has been flagged to handle this conservatively.";
  return "This panel keeps secondary details available without cluttering gym mode.";
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

function ChoiceScreen({ eyebrow, title, copy, options, selected, toggle, grid }) {
  return <div className="onboard-stack"><Title eyebrow={eyebrow} title={title} copy={copy} /><div className={grid ? "choice-grid" : "choice-list"}>{options.map((x, i) => <button key={x} style={{ "--i": i }} className={selected.includes(x) ? "selected" : ""} onClick={() => toggle(x)}><span>{selected.includes(x) ? <CheckCircle2 /> : <Circle />}</span><b>{x}</b></button>)}</div></div>;
}

function ThinkingOrb() {
  return <div className="thinking"><span className="halo h1" /><span className="halo h2" /><span className="halo h3" />{Array.from({ length: 10 }).map((_, i) => <i key={i} style={{ "--i": i }} />)}<div className="thinking-core"><Logo compact /><em /><em /><em /></div></div>;
}

function Consistency() {
  return <section className="dark-card consistency"><span className="badge teal">Goal progress</span><h2>First target path</h2><p>Based on consistency, completed sets, and check-ins.</p><div className="weeks">{[0,1,2,3].map(w => <div key={w}><b>W{w+1}</b>{[0,1,2,3,4,5,6].map((d) => <i key={d} className={(d + w) % 3 === 0 ? "done" : d > 4 && w === 3 ? "scan" : ""} />)}</div>)}</div></section>;
}

function ExerciseRow({ ex }) {
  return <section className="exercise-row"><img src={assetUrl(ex.image_url)} alt="" /><div><h3>{ex.name}</h3><p>{ex.station}</p><div className="chips"><span>{ex.sets} sets</span><span>{ex.reps}</span><span>{ex.load}</span><span>{ex.mode}</span></div><p>{ex.note}</p></div></section>;
}

function assetUrl(url) {
  if (!url) return AS("training-plan.jpeg");
  if (url.startsWith("/assets/")) return AS(url.replace("/assets/", ""));
  return url;
}

createRoot(document.getElementById("root")).render(<App />);
