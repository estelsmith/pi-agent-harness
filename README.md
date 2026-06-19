# Pi Agent Harness

[Random related notes](https://gist.github.com/estelsmith/d1b7dd789567a34ef63965bb292692f8)

This directory contains the `pi` agent harness — a self-contained environment for running AI coding agents against
this project. It wires together [Pi](https://pi.dev/), [pi-acp](https://github.com/svkozak/pi-acp),
[Safehouse](https://agent-safehouse.dev/), and [oMLX](https://github.com/jundot/omlx) into a single, sandboxed
pipeline that can be driven by any ACP-compatible client (e.g. JetBrains AI Assistant).

> **Note:** This harness is optimised for macOS.

---

## Prerequisites

The following tools must be installed and available before using this harness.

| Tool | Purpose | Default location |
|------|---------|-----------------|
| [`pi`](https://pi.dev/) | Core agent runtime | `~/npm/bin/pi` |
| [`pi-acp`](https://github.com/svkozak/pi-acp) | ACP server that wraps `pi` | resolved via `PATH` |
| [`safehouse`](https://agent-safehouse.dev/) | Sandbox that restricts filesystem access | `~/.homebrew/bin/safehouse` |
| [`oMLX`](https://github.com/jundot/omlx) | High-performance local LLM inference (macOS) | `http://localhost:11434` |

You can override the default binary paths with environment variables:

```bash
PI_BIN=/custom/path/to/pi          # overrides ~/npm/bin/pi
SAFEHOUSE_BIN=/custom/path/to/safehouse  # overrides ~/.homebrew/bin/safehouse
```

---

## Directory Structure

```
.pi/
├── bin/
│   ├── pi                  # Wrapper: runs pi inside safehouse
│   ├── pi-acp-bridge       # Entry point: starts the ACP server
│   ├── safehouse           # Wrapper: invokes the safehouse sandbox
│   └── .util/
│       └── log.sh          # Shared logging utilities used by all bin scripts
├── agent/
│   ├── auth.json           # Local LLM connection credentials (gitignored)
│   ├── settings.json       # Pi agent settings, installed extensions, default model
│   ├── sessions/           # Per-session JSONL conversation logs (gitignored)
│   └── npm/                # Locally installed Pi extensions (gitignored)
├── logs/                   # ACP session logs (gitignored)
├── .gitignore
```

### Key Components

- **`bin/pi-acp-bridge`** — The primary entry point. Configures environment variables, prepends `bin/` to `PATH` so
  `pi-acp` can find the local `pi` wrapper, prunes stale sessions (>24 h), and starts the `pi-acp` ACP server.
- **`bin/pi`** — Wraps the `pi` executable. Logs the active configuration, and launches `pi` inside
  the `safehouse` sandbox.
- **`bin/safehouse`** — Thin wrapper around the `safehouse` binary. Add any global sandbox options here.
- **`agent/settings.json`** — Pi runtime settings. Currently installs the
  [`@monroewilliams/pi-local`](https://github.com/monroewilliams/pi-local) extension and sets the default provider
  and model.
- **`agent/auth.json`** — Stores local LLM connection credentials (gitignored). Managed automatically
  by the `pi-local` extension.

---

## Setup

### 1. Configure the environment

If you need to override the default binary paths for the harness, use the following environment variables:

```bash
PI_BIN=/custom/path/to/pi          # overrides ~/npm/bin/pi
SAFEHOUSE_BIN=/custom/path/to/safehouse  # overrides ~/.homebrew/bin/safehouse
```

### 2. Start oMLX

Launch oMLX and ensure it is listening on `http://localhost:11434`. The harness is pre-configured to use
`gemma-4-26b-a4b-it-4bit` by default; you can change the model via the `/local-model` command inside Pi (see below).

### 3. Configure the ACP client

Point your ACP-compatible client at `bin/pi-acp-bridge`. For JetBrains AI Assistant, add an entry to
`~/.jetbrains/acp.json`:

```json
{
    "default_mcp_settings": {},
    "agent_servers": {
        "pi-engage": {
            "command": "/absolute/path/to/your/project/.pi/bin/pi-acp-bridge"
        }
    }
}
```

---

## Local LLM Management (`pi-local` extension)

The [`@monroewilliams/pi-local`](https://github.com/monroewilliams/pi-local) extension is installed automatically by
Pi on first run. It lets you manage multiple local inference backends from within the Pi chat interface.

### Supported backends

| Backend | Auto-detection endpoint | Load / Unload |
|---------|------------------------|---------------|
| oMLX | `/v1/models/status`, `/api/status` | ✅ |
| LM Studio | `/api/v1/models` | ✅ |
| OpenAI-compatible | `/v1/models` | ❌ |

### Commands

| Command | Description |
|---------|-------------|
| `/local-login` | Add or remove inference server connections. On macOS, API keys can be stored in the system keychain. |
| `/local-model` | Switch the active connection and model. Displays server stats, model size, context window, and type. |

Connections are persisted in `agent/auth.json`; the default provider and model are persisted in `agent/settings.json`.

---

## Sandboxing

All `pi` invocations run inside [Safehouse](https://agent-safehouse.dev/), which restricts the agent's filesystem
access. The `pi` wrapper grants the following read-only paths in addition to Safehouse's defaults:

- `~/npm` — required so the sandbox can reach the `pi` executable.

To grant the agent access to additional paths, edit the `log_exec safehouse ...` call in `bin/pi`.

---

## Logging

Each `pi-acp-bridge` invocation writes a timestamped log file to `logs/` (e.g. `2026-06-18T15-41-19_acp.log`).
The five most recent log files are kept automatically; older ones are pruned on startup.

Logs capture:
- Environment variables loaded from `pi.env`
- Every command executed via `log_exec` and its exit code
- Session pruning activity

`logs/` is gitignored.

---

## Gitignored Files

The following paths are excluded from version control and must be set up locally:

| Path | Reason |
|------|--------|
| `logs/` | Runtime log files |
| `agent/sessions/` | Per-session conversation history |
| `agent/npm/` | Locally installed Pi extensions |
| `agent/auth.json` | LLM credentials and cached model metadata |
