# Testing Guide (Current Baseline)

## 1) Static checks

```bash
npm run lint
npm run build
```

## 2) Full backend smoke test (automated)

This starts the API, executes the core lifecycle, and exits with pass/fail:

```bash
npm run smoke
```

Smoke flow currently validates:
1. health endpoint
2. project creation
3. requirements save
4. version generation (mock)
5. versions list

## 3) Manual UI check

Run in two terminals:

```bash
npm run dev:api
npm run dev
```

Then open `http://localhost:3000` and use **MVP Kickoff Console**.

