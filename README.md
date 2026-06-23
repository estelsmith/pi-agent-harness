# Pi Agent Harness

[Random related notes](https://gist.github.com/estelsmith/d1b7dd789567a34ef63965bb292692f8)

This directory contains the `pi` agent harness — a self-contained environment for running AI coding agents against
this project. It wires together [Pi](https://pi.dev/), [pi-acp](https://github.com/svkozak/pi-acp),
[Agent Safehouse](https://agent-safehouse.dev/), and [oMLX](https://omlx.ai/) into a single, sandboxed
pipeline that can be driven by any ACP-compatible client (e.g. JetBrains AI Assistant). Local dependency management is handled by [Mise](https://mise.en.dev/).

> **Note:** This harness is optimised for macOS.

---

## Prerequisites

The following tools must be installed and available before using this harness.

| Tool | Purpose                                                          | Default location |
|------|------------------------------------------------------------------|-----------------|
| [`mise`](https://mise.en.dev/) | Manages local dependencies for `node`, `npm`, `pi`, and `pi-acp` | resolved via `PATH` |
| [`oMLX`](https://omlx.ai/) | High-performance local LLM inference (macOS)                     | `http://localhost:11434` |

---

## Technologies Used

This harness integrates several specialized tools to provide a robust environment for AI coding agents:

- **[Mise](https://mise.en.dev/)** — The tool manager used to manage the runtime environment.
- **[Pi](https://pi.dev/)** — The core agent runtime (managed via Mise/npm).
- **[pi-acp](https://github.com/svkozak/pi-acp)** — An ACP server that wraps `pi` (managed via Mise/npm).
- **[Agent Safehouse](https://agent-safehouse.dev/)** — A sandbox that restricts filesystem and network access.
- **[oMLX](https://omlx.ai/)** — High-performance local LLM inference (macOS).
- **[pi-local](https://github.com/monroewilliams/pi-local)** — An extension for connecting Pi to oMLX via oMLX native APIs.

---

## Directory Structure

```
bin/
├── pi                  # Wrapper: runs pi inside agent-safehouse
├── pi-acp-bridge       # Entry point: starts the ACP server
├── .vendor/            # Local vendor tools
│   └── safehouse.sh    # Local copy of agent-safehouse
└── .util/
    └── log.sh          # Shared logging utilities used by all bin scripts
agent/
├── auth.json           # Local LLM connection credentials. Managed automatically
│   │               │   # by the `pi-local` extension.
├── settings.json       # Pi agent settings, installed extensions, default model
├── sessions/           # Per-session JSONL conversation logs (gitignored)
└── npm/                # Locally installed Pi extensions (gitignored)
logs/                   # ACP session logs (gitignored)
.gitignore
```

### Project Files

- **`bin/pi-acp-bridge`** — The primary entry point. Configures environment variables, prepends `bin/` to `PATH` so
  `pi-acp` can find the local `pi` wrapper, prunes stale sessions (>24 h), and starts the `pi-acp` ACP server.
- **`bin/pi`** — Wraps the `pi` executable. Logs the active configuration, and launches `pi` inside
  the `agent-safehouse` sandbox.
- **`agent/settings.json`** — Pi runtime settings. Installs extensions, and sets the default provider and model.
- **`agent/auth.json`** — Stores local LLM connection credentials. Managed automatically
  by the `pi-local` extension.

## Extensions

### agent-tools
Located at `agent/extensions/agent-tools/`, this extension provides specialized tools for the agent:
- `fetch-url`: Allows the agent to fetch content from a web URL.
- `execute-code`: Allows the agent to run JavaScript code in a sandboxed environment. This tool provides network access
  via `fetch` and access to `JSON`, but the sandbox restricts all other activities.

---

## Setup

### 1. Start oMLX

Launch oMLX and ensure it is listening on `http://localhost:11434`. The harness is pre-configured to use
`gemma-4-26b-a4b-it-4bit` by default; you can change the model via the `/local-model` command inside Pi (see below).

### 2. Configure the ACP client

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

## Sandboxing

All `pi` invocations run inside [Agent Safehouse](https://agent-safehouse.dev/), which restricts the agent's filesystem
access.

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
