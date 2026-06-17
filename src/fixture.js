export const fixtureSession = {
  schema_version: "2026-06-17",
  session_id: "ws_demo_001",
  member_id: "mem_demo_001",
  gym_id: "gym_demo_001",
  status: "active",
  expires_at: "2026-06-18T18:00:00Z",
  member_display_name: "Andrea",
  coach_persona: "edgy_supportive",
  title: "Lower Body + Core",
  timezone: "Europe/Berlin",
  duration_minutes: 58,
  focus: "Strength build with knee-safe conditioning",
  rationale: "Built around fat loss, strength, and a knee-safe return to consistent training.",
  warmup: ["5 minutes easy bike or crosstrainer", "2 rounds of hip hinges, bodyweight squats, and shoulder circles"],
  cooldown: ["3 minutes easy walk", "Light quad, hamstring, and lat stretch"],
  safety_notes: ["Keep knee movement smooth and pain-free.", "Stop and message the coach if sharp pain appears."],
  metrics: { exercise_count: 3, target_days_per_week: 3, plan_match_percent: 92 },
  exercises: [
    {
      exercise_id: "ex_leg_press",
      name: "Leg Press",
      station: "Leg press station",
      mode: "guided",
      sets: 4,
      reps: "8-10",
      load: "92 kg",
      rest_seconds: 120,
      image_url: "/assets/leg-press.png",
      note: "Drive through the middle of the foot and keep the knees tracking forward.",
      substitutions: [{ name: "Goblet Squat To Box", reason: "Use if leg press is taken and knee feels stable." }]
    },
    {
      exercise_id: "ex_hamstring_curl",
      name: "Hamstring Curl",
      station: "Hamstring curl station",
      mode: "guided",
      sets: 3,
      reps: "10-12",
      load: "42 kg",
      rest_seconds: 90,
      image_url: "/assets/pull.png",
      note: "Control the return and keep your hips heavy on the pad.",
      substitutions: [{ name: "Dumbbell Romanian Deadlift", reason: "Use if the curl machine is unavailable." }]
    },
    {
      exercise_id: "ex_cable_crunch",
      name: "Cable Crunch",
      station: "Cable station",
      mode: "manual",
      sets: 3,
      reps: "12",
      load: "31 kg",
      rest_seconds: 75,
      image_url: "/assets/chest-press.png",
      note: "Move through the ribs, not the hips. Keep every rep controlled.",
      substitutions: [{ name: "Dead Bug", reason: "Use if the cable station is unavailable." }]
    }
  ],
  actions: {
    complete_session_url: "/api/workout-sessions/ws_demo_001/events",
    event_url: "/api/workout-sessions/ws_demo_001/events",
    refresh_url: "/api/workout-sessions/ws_demo_001"
  }
};

export const weekSessions = [
  { day: "Mon", title: "Lower Body + Core", duration: "58 min", focus: fixtureSession.focus },
  { day: "Wed", title: "Push + Mobility", duration: "52 min", focus: "Chest, shoulders, mobility" },
  { day: "Fri", title: "Pull + Conditioning", duration: "61 min", focus: "Back, arms, endurance" }
];
