Local run (dev):
  # backend
  cd ai-resume-builder/backend
  npm install
  npm run dev

  # frontend
  cd ../frontend
  npm install
  npm run dev

  # worker (optional)
  cd ../worker
  node src/index.js

Run tests:
  cd ai-resume-builder/backend
  npm test

CI:
  The included GitHub Actions workflow .github/workflows/ci.yml runs the backend tests and secrets check on push/PR to main.

Production (suggested minimal):
  - Build frontend (vite build) and serve statically via nginx or a small node static server.
  - Run backend in production mode:
      NODE_ENV=production PORT=4000 node src/index.js
  - Run worker(s) as systemd services or Docker containers.
  - Use proper secrets via environment variables (example names in .env.example). NEVER put secrets in frontend source.

Docker-compose (optional):
  Provide a minimal compose later on request (will include backend, frontend static server, and worker).
