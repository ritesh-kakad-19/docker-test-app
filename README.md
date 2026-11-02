<p align="left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://shieldcn.dev/header/graph.svg?title=Docker+Test+App&subtitle=Express+%2B+MongoDB+signup+stack+on+Docker+Compose&logo=docker&align=left&theme=slate&mode=dark" />
    <img alt="Docker Test App — Express + MongoDB signup stack on Docker Compose" src="https://shieldcn.dev/header/graph.svg?title=Docker+Test+App&subtitle=Express+%2B+MongoDB+signup+stack+on+Docker+Compose&logo=docker&align=left&theme=slate&mode=light" />
  </picture>
</p>

<p align="center">
  <a href="https://nodejs.org"><img alt="Node.js 22" src="https://shieldcn.dev/badge/Node.js-22-339933?logo=node.js&variant=secondary" /></a>
  <a href="https://expressjs.com"><img alt="Express 5" src="https://shieldcn.dev/badge/Express-5-000000?logo=express&variant=secondary" /></a>
  <a href="https://www.mongodb.com"><img alt="MongoDB 7" src="https://shieldcn.dev/badge/MongoDB-7-47A248?logo=mongodb&variant=secondary" /></a>
  <a href="https://docs.docker.com/compose/"><img alt="Docker Compose" src="https://shieldcn.dev/badge/Docker-Compose-2496ED?logo=docker&variant=secondary" /></a>
  <img alt="License ISC" src="https://shieldcn.dev/badge/License-ISC-blue?variant=secondary" />
</p>

A small full-stack demo that shows how to run a Node.js/Express app next to MongoDB and Mongo Express with Docker Compose. The front end is a static "XYZ University" signup page that writes students into a `users` collection and reads them back over a tiny JSON API.

---

## Table of contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running without Docker](#running-without-docker)
- [API](#api)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Known issues](#known-issues)
- [License](#license)

## Overview

The project is intentionally minimal — three services and one page — and is meant as a learning sandbox for containerized Node + Mongo development.

- **`app`** — Express 5 server that serves `public/` and exposes two Mongo-backed endpoints.
- **`mongo`** — Official MongoDB image, initialized with a root user from `.env`.
- **`mongo-express`** — Web UI for browsing the database at [http://localhost:8081](http://localhost:8081).

All three containers share the `mongo-network` bridge network.

## Architecture

```mermaid
flowchart LR
    B[Browser] -->|:5000| A[app<br/>Express 5]
    B -->|:8081| E[mongo-express]
    A -->|mongodb://mongo:27017| M[(mongo<br/>MongoDB)]
    E --> M
    subgraph mongo-network
        A
        E
        M
    end
```

| Service | Container | Host port | Purpose |
| --- | --- | --- | --- |
| `app` | `node-app` | `5000` | Express server + static signup page |
| `mongo` | `mongodb` | `27017` | MongoDB database |
| `mongo-express` | `mongodb-exprress` | `8081` | Database admin UI |

## Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 22 (`node:22-alpine`) |
| Server | Express `^5.3.0` |
| Database | MongoDB via the official `mongodb` driver `^7.7.0` |
| Config | `dotenv` `^18.0.9` |
| Front end | Static HTML + CSS in `public/` |
| Orchestration | Docker Compose (`compose.yaml`) |

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine with the Compose plugin
- Git (optional)

### 1. Configure environment

Create a `.env` file next to `compose.yaml`. Compose refuses to start without the two Mongo variables:

```dotenv
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=change-me
PORT=5000
```

> Use a real password. The values above are placeholders, and `.env` is already listed in `.gitignore` and `.dockerignore`.

### 2. Start the stack

```bash
docker compose up --build
```

Add `-d` to run detached.

### 3. Open the services

| URL | What |
| --- | --- |
| http://localhost:5000 | Signup page |
| http://localhost:5000/getUsers | Raw JSON of all users |
| http://localhost:8081 | Mongo Express UI |

### 4. Stop and clean up

```bash
# stop and remove the containers (and, since there is no named volume, the data)
docker compose down
```

`compose.yaml` does not declare a volume for `mongo`, so database contents live in the container and are lost on `down`. Add a named volume if you want persistence.

## Environment variables

| Variable | Used by | Example | Notes |
| --- | --- | --- | --- |
| `PORT` | `app` | `5000` | Port Express listens on; also exposed by the `app` service |
| `MONGO_URL` | `app` | `mongodb://admin:change-me@mongo:27017/?authSource=admin` | Built by Compose; host must be the **service name** `mongo` |
| `MONGO_ROOT_USERNAME` | `mongo`, `mongo-express` | `admin` | Required by Compose (`:?` guard) |
| `MONGO_ROOT_PASSWORD` | `mongo`, `mongo-express` | `change-me` | Required by Compose (`:?` guard) |

For local (non-Docker) runs, `MONGO_URL` should point at `localhost` instead of `mongo`.

## Running without Docker

```bash
npm install
npm start
```

You still need a MongoDB instance reachable at the URL in `MONGO_URL` (default `.env` uses `mongodb://admin:qwerty@localhost:27017/?authSource=admin`).

The app listens on `PORT` (`5000` by default) and serves `public/` statically.

## API

### `GET /getUsers`

Returns every document in the `users` collection as a JSON array.

```bash
curl http://localhost:5000/getUsers
```

```json
[
  { "_id": "66f1c0...", "email": "jane@email.com", "username": "Jane Doe", "password": "password" }
]
```

### `POST /addUser`

Accepts a form-encoded body and inserts it into `users`.

```bash
curl -X POST http://localhost:5000/addUser \
  -d "email=jane@email.com" \
  -d "username=Jane Doe" \
  -d "password=password"
```

Responds with the plain-text confirmation `data inserted in DB`.

| Field | Type | Notes |
| --- | --- | --- |
| `email` | string | From the signup form |
| `username` | string | From the signup form |
| `password` | string | Stored as-is — demo only, never do this in production |

The database name (`college-db`) and collection (`users`) are hardcoded in `index.js`.

## Project structure

```text
docker-test-app/
├── compose.yaml        # app + mongo + mongo-express services
├── Dockerfile          # node:22-alpine image for the app
├── index.js            # Express server and Mongo routes
├── package.json
├── public/
│   ├── index.html      # signup page
│   └── style.css
├── .env                # local secrets (gitignored)
├── .dockerignore
└── .gitignore
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the server with `node index.js` |
| `npm test` | Placeholder — exits with an error until tests are added |

## Known issues

These are worth fixing before using the project as anything more than a demo:

1. **`client.connect(URL)` is undefined.** Both routes call `client.connect(URL)`, but `URL` is never declared. Drop the argument — the connection string is already supplied to `new MongoClient(process.env.MONGO_URL)`.
2. **Wrong Mongo hostname in `compose.yaml`.** The `app` service uses `@mongodb:27017`, but the Compose service is named `mongo` (`mongodb` is only the container name, which is not a DNS alias). Use `@mongo:27017`.
3. **Plaintext passwords.** The signup form stores passwords unchanged. Hash them before this leaves the sandbox.
4. **No error handling.** Mongo failures reject the request with an unhandled promise rejection; add `try/catch` and a proper status code.
5. **No persistent Mongo volume.** Data disappears whenever the containers are removed; add a named volume and mount it at `/data/db` for persistence.
6. **No `.env.example`.** New contributors have to reconstruct the variables from this README.

## License

ISC — see `package.json`. Add a `LICENSE` file if you plan to distribute the project.
