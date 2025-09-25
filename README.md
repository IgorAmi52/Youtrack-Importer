# YouTrack Importer

Import and sync GitHub issues into YouTrack.
Works in **two modes**:

* **Webhook mode** (recommended): real-time sync via GitHub Webhooks.
* **Polling mode**: periodic checks if webhooks aren’t available.

> Logic: if `GITHUB_WEBHOOK_SECRET` **is set**, app runs **webhook** mode; if it’s **not set**, app defaults to **polling**.

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Configuration (.env)](#configuration-env)
6. [Running with Docker Compose](#running-with-docker-compose)
7. [GitHub Webhook Setup](#github-webhook-setup)
8. [How the Worker/Pipeline Runs](#how-the-workerpipeline-runs)
9. [License](#license)

---

## Features

* ⚡ Real-time **webhook** ingestion (or fallback **polling**).
* 🔗 Maps GitHub events to **YouTrack** entities.
* 🧰 Configurable via `.env`.
* 🧵 Worker with **pipeline** for parallel API calls & data processing.
* 🐳 First-class Docker support (`docker-compose.yml`).

---

## Architecture

* **Fastify API server**: Handles webhooks, polling, and user mapping endpoints.
* **Service layer**: Contains business logic for syncing issues and user mappings.
* **Connectors**: Integrate with GitHub and YouTrack APIs.
* **Database (SQLite)**: Stores:

  * **links**: mapping between GitHub issues and YouTrack issues
  * **userMappings**: mapping between GitHub usernames and YouTrack usernames (for assignee sync)
  * **meta**: stores last sync timestamp
* **Polling/Webhook**: Supports both periodic polling and real-time webhook sync from GitHub.

---

## API: Add User Mapping

You can add or update user mappings (for assignee sync) via the following API:

**POST** `/user-mappings`

**Body:**

```json
{
  "github": "github-username",
  "youtrack": "youtrack-username"
}
```

**Response:**

* `200 OK` on success
* `400 Bad Request` if input is invalid

This allows you to map GitHub usernames to YouTrack usernames for correct assignee syncing.

---

## Prerequisites

* **Node.js** 18+ and **npm** (or **pnpm/yarn**)
* **Docker** & **Docker Compose** (for containerized run)
* A **YouTrack** instance and a **Permanent Token**
* (Webhook mode only) A public URL for GitHub to reach your local server.
  This guide uses **Cloudflared** (super easy, no login required).

---

## Quick Start

### 1) Clone repo

```bash
git clone https://github.com/IgorAmi52/Youtrack-Importer.git
cd Youtrack-Importer
```

### 2) Copy env template and edit values

```bash
cp .env.example .env
```

### 3) Open `.env` in your editor and fill in required values

### 4) Install & build

```bash
npm install
npm run build
```

### 5) Run the app

```bash
npm run start
```

* If `GITHUB_WEBHOOK_SECRET` is set → runs in **webhook mode** (use Cloudflared + GitHub webhook setup).
* If not set → runs in **polling mode** (polls GitHub at `POLL_INTERVAL_MS`).

---

## Configuration (.env)

Edit `.env` (created from `.env.example`).
Typical variables include:

* **GitHub**

  * `GITHUB_TOKEN=`
  * `GITHUB_REPO_OWNER=`
  * `GITHUB_REPO_NAME=`
  * `GITHUB_WEBHOOK_SECRET=` *(set to enable webhook mode; unset = polling)*
* **YouTrack**

  * `YOUTRACK_BASE_URL=`
  * `YOUTRACK_TOKEN=`
* **Server**

  * `PORT=` (default `3000`)
* **Polling**

  * `POLL_INTERVAL_MS=` (e.g., `10000` for 10s)

---

## Running with Docker Compose

### 1) Copy env template and edit values

```bash
cp .env.example .env
```

### 2) Build and start containers

```bash
docker compose up --build -d
```

---

## GitHub Webhook Setup

1. Get your Cloudflared URL:

   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
2. In GitHub repo:
   **Settings → Webhooks → Add webhook**
3. Fill the form:

   * **Payload URL**: `https://<your-cloudflared-subdomain>/webhook`
   * **Content type**: `application/json`
   * **Secret**: same as `GITHUB_WEBHOOK_SECRET`
   * **Events**: Issues, Comments, PRs (or as needed)

---

## How the Worker/Pipeline Runs

The worker processes tasks through a **pipeline** that:

* Normalizes GitHub payloads
* Resolves mappings to YouTrack fields
* Batches & parallelizes API requests

---

## License

MIT — see [LICENSE](./LICENSE)
