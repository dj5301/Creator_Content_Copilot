<<<<<<< HEAD
# Creator Copilot

Creator Copilot is a dual-interface AI content assistant:

- A Next.js landing page and web shell for demoing the product flow
- A Streamlit app for the full content-analysis workspace
- OpenAI as the primary LLM route, with Ollama as a local fallback option

The project is designed to run locally first, then move cleanly into Docker and AWS.

## Architecture

```text
Landing Page (Next.js)
  app/page.tsx
  components/creator-copilot-landing-page.tsx
        |
        v
Start Free Trial API
  app/api/start-free-trial/route.ts
        |
        v
Streamlit App
  app.py
        |
        v
LLM Routing
  OpenAI primary
  Ollama fallback
```

## Current Structure

```text
creator_copilot/
├─ app/
│  ├─ api/start-free-trial/route.ts
│  ├─ free-trial/page.tsx
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ creator-copilot-landing-page.tsx
│  └─ ui/
│     ├─ button.tsx
│     └─ card.tsx
├─ lib/
│  └─ utils.ts
├─ app.py
├─ requirements.txt
├─ Dockerfile
├─ docker-compose.yml
├─ package.json
└─ .env.example
```

## Prerequisites

- Node.js 22+ recommended
- npm 10+
- Python 3.9+
- Optional: Ollama installed locally if you want fallback generation
- Optional: Docker Desktop

## Environment Variables

Copy the example file first:

```bash
cp .env.example .env
```

Then fill in the real values.

| Variable | Purpose | Example |
| --- | --- | --- |
| `PRIMARY_PROVIDER` | Primary LLM route | `openai` |
| `FALLBACK_TO_LOCAL` | Whether to fall back to Ollama | `true` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | OpenAI model name | `gpt-5.4-mini` |
| `OPENAI_BASE_URL` | Optional custom OpenAI-compatible base URL | blank |
| `OLLAMA_ENABLED` | Enables local Ollama fallback | `true` |
| `OLLAMA_MODEL` | Local Ollama model | `gemma3` |
| `OLLAMA_BASE_URL` | Ollama OpenAI-compatible endpoint | `http://localhost:11434/v1/` |
| `OLLAMA_API_KEY` | Placeholder key for Ollama routing | `ollama` |
| `LANDING_PAGE_URL` | URL used by the Streamlit back-link | `http://localhost:3000` |
| `STREAMLIT_PORT` | Local Streamlit port | `8501` |
| `STREAMLIT_SERVER_ADDRESS` | Address Streamlit binds to | `127.0.0.1` locally, `0.0.0.0` in Docker |
| `STREAMLIT_PUBLIC_URL` | URL that the browser opens for Streamlit | `http://localhost:8501` |
| `STREAMLIT_MANAGED_EXTERNALLY` | Skip spawning local Streamlit and just redirect | `false` locally, often `true` in split AWS deployments |
| `PYTHON_BINARY` | Optional override for the Python executable | blank |

## Local Development

### 1. Install JavaScript dependencies

```bash
npm install
```

### 2. Create a fresh Python virtual environment

If you moved the project folder, recreate the virtual environment. Python venv shebangs store absolute paths, so a moved repo can leave the old `venv/` broken.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Start the landing page

```bash
npm run dev
```

Open:

- Landing page: `http://localhost:3000`
- Demo section: `http://localhost:3000/#demo`

### 4. Start Streamlit directly if you want

```bash
source .venv/bin/activate
python -m streamlit run app.py
```

Open:

- Streamlit app: `http://localhost:8501`

### 5. Or launch Streamlit from the landing page

Use the `Start Free Trial` button on the landing page.

That button calls `app/api/start-free-trial/route.ts`, which:

- checks whether Streamlit is already up
- starts `app.py` if needed
- redirects the browser to `STREAMLIT_PUBLIC_URL`

## Reproducible Local Setup

For a clean install on another machine:

```bash
git clone <your-repo-url>
cd creator_copilot
cp .env.example .env
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm run dev
```

## Docker

This repo ships with:

- `Dockerfile`
- `docker-compose.yml`

### Build and run

```bash
docker compose up --build
```

Open:

- Landing page: `http://localhost:3000`
- Streamlit app: `http://localhost:8501`

### Notes

- The container exposes both ports `3000` and `8501`
- In Docker, `STREAMLIT_SERVER_ADDRESS` should be `0.0.0.0`
- The compose file already sets the correct local values for the dual-port setup

## AWS Deployment

### Recommended first target: EC2 + Docker Compose

For this project's current architecture, EC2 is the fastest AWS path because:

- the landing page runs on port `3000`
- Streamlit runs on port `8501`
- the web app may spawn Streamlit locally

That maps cleanly to one EC2 host and one Docker Compose stack.

### EC2 steps

1. Launch an Ubuntu EC2 instance
2. Open security-group ports:
   - `3000` for the landing page
   - `8501` for Streamlit
   - optionally `80/443` if you front it with Nginx
3. Install Docker and Docker Compose plugin
4. Copy the repo to the server
5. Create a real `.env`
6. Run:

```bash
docker compose up --build -d
```

### ECS / App Runner later

If you later split the services, deploy:

- Next.js web app as one service
- Streamlit as a second service

Then set on the web service:

```env
STREAMLIT_MANAGED_EXTERNALLY=true
STREAMLIT_PUBLIC_URL=https://your-streamlit-service-url
```

In that mode, the landing page stops trying to spawn Streamlit locally and simply redirects users to the external Streamlit service.

## GitHub Actions

Two workflows are included:

- `.github/workflows/ci.yml`
  - installs Node and Python
  - builds the Next app
  - installs Python deps
  - validates `app.py`

- `.github/workflows/deploy-ec2.yml`
  - copies the repo to EC2
  - runs `docker compose up --build -d`

### Required EC2 deployment secrets

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT`
- `EC2_DEPLOY_PATH`

## Troubleshooting

### `npm run dev` fails after moving the folder

If the project path changed, your old `venv/` may point to the old folder path. Create a fresh `.venv` and reinstall Python packages.

### `Start Free Trial` opens a blank page

That used to happen when the browser opened a new tab before Streamlit finished booting. The project now uses a `/free-trial` loading page to bridge that gap.

### Streamlit should not be spawned by the web app in production

Set:

```env
STREAMLIT_MANAGED_EXTERNALLY=true
STREAMLIT_PUBLIC_URL=https://your-streamlit-domain
```

## Next Recommended Steps

1. Rotate any real API keys currently stored in local `.env` files.
2. Commit the structure cleanup and docs.
3. Test `docker compose up --build` locally.
4. Deploy the Docker version to EC2 first.
5. Add a reverse proxy and HTTPS before sharing publicly.
=======
# Creator_Content_Copilot
>>>>>>> 3909bf2250bc8bd81646e79462e349824c0eaf6a
