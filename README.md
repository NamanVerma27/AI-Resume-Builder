# AI Resume Builder (Anonymous-first)

## Project goal (short)
An anonymous-first, production-ready AI Resume Builder. We will build this step-by-step, one milestone at a time. Default local dev uses deterministic mocks (no API keys required).

## How we'll work
- **One milestone at a time.** I will produce the files / endpoints for a milestone; you implement them locally and paste the verification outputs back. I will not implement beyond the current milestone until you confirm acceptance.
- **No secrets in frontend.** Secrets live in server-side env vars only (see `.env.example`). Do NOT add secrets with `VITE_` or `PUBLIC_` prefixes in server envs.
- **Provider-agnostic LLM adapter.** Local dev uses a mock adapter. I will show how to plug in real providers later.
- **Security checks.** Before any deployment we will use `npm run check-secrets` (will be provided in later milestones) to scan artifacts for common secret patterns (VITE_, API_KEY leaked in frontend, etc).

## Milestone sequence (high level)
- Milestone 0: Prereqs & scaffold (this step)
- Milestone 1: Backend skeleton + resume CRUD API + LLM adapter mock
- Milestone 2: Frontend scaffold (React + Vite + Tailwind) + editor page
- Milestone 3: Frontend ↔ Backend integration (anonymous save/get by slug)
- Milestone 4: LLM generation UI calling backend /api/v1/generate
- Milestone 5: Worker for PDF export + job queue
- Milestone 6: ATS scoring, tests, CI example, deployment guide

## What I need from you now (run & paste)
1. Run the *Prerequisite checks* commands (node, npm, git). Copy/paste the outputs back into the chat.
2. Run the *Scaffold commands* to create the folder structure. Then run `ls -R` (or `tree`) of `ai-resume-builder` and paste that output back.

(After I verify these, I'll produce Milestone 1.)

## Quick note about editing files
You will copy/paste the file contents from my messages into files at the paths shown. Keep your `.env` files out of git and only commit `.env.example`.
