Product Requirements Document (PRD)

Project: Habit Layering SPA (AuDHD Friendly)

1. Objective

A low-pressure, high-celebration habit tracking tool designed for neurodivergent regulation. The app focuses on "Habit Layering"—ensuring a habit is integrated (low resistance) before adding complexity.

2. User Personas

Primary: AuDHD individual recovering from burnout/depression.

Needs: Low demand, high visual reward, clear "done" states, no penalty for missed days.

3. Core Features

Resistance-Based Tracking: Instead of just "Yes/No," users grade the friction (1-3 scale).

Automated Layering Prompts: Logic triggers after 7-10 "Low Resistance" entries to suggest adding the next habit.

Dopamine Hits: Integrated canvas-confetti upon completion of a daily habit.

History Visualization: A non-judgmental retrospective view showing the "vibe" of habit integration rather than a streak.

4. Technical Stack (The Blueprint)

Framework: Astro (SSR Mode)

Library: React (with Framer Motion for micro-interactions)

Styling: Tailwind CSS (Strict Agent Army Brand Guidelines)

Database: Supabase (initial local testing/manual setup)

Build Tool: Vite

Deployment Path: GitHub -> Vercel (Future)

5. Success Metrics

Resistance Score: High success is indicated by a sustained Low (1) resistance score over 10 days.

Layering Rate: Measured by the transition from one active habit to two.