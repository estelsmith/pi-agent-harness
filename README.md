# Pi Agent Harness

[Random related notes](https://gist.github.com/estelsmith/d1b7dd789567a34ef63965bb292692f8)

This directory contains the `pi` agent harness, designed to provide a robust environment for AI coding agents.

## Overview

The `pi` harness is an agent-focused environment that uses the Pi framework to facilitate complex coding tasks. It is
designed to work seamlessly with local project directories and provides entry scripts to bridge the gap between the
agent and external AI programming tools (like JetBrains AI Assistant or other ACP-compatible assistants).

**Note:** This harness is optimized for macOS and leverages [oMLX](https://github.com/jundot/omlx) for high-performance
local inference.

This project is intended to be dropped into a project directory and act as an agent for that project.

### Key Components

- **[pi](https://pi.dev/)**: The core agent harness directory.
- **`bin/`**: Contains entry point scripts and utilities, including:
    - `pi-acp-bridge`: The primary entry point for connecting the agent to ACP-compatible environments.
    - `pi`: A wrapper around the `pi` executable.
    - [`safehouse`](https://agent-safehouse.dev/): A wrapper around the `safehouse` sandboxing environment used to
      execute `pi.dev` processes, ensuring they cannot run rampant across the user's machine.
- **`agent/`**: Contains core agent logic and capabilities as defined by `pi`.
- **`pi.env`**: Environment configuration for the harness. This file should be configured to point to the absolute path
  of the directory where this repository is checked out.

## Integration with JetBrains / ACP

The main entry point for external agents is `pi-acp-bridge`. To use this harness with a tool like JetBrains AI
Assistant, you can configure it via an `acp.json` file.

### Example JetBrains `acp.json` Configuration

```json
{
    "default_mcp_settings": {},
    "agent_servers": {
        "pi-myrepo": {
            "command": "/path/to/your/project/.pi/bin/pi-acp-bridge"
        }
    }
}
```
