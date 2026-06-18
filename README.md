# Pi Agent Harness

This directory contains the `pi` agent harness, designed to provide a robust environment for AI coding agents.

## Overview

The `pi` harness is an agent-focused environment that uses the Pi framework to facilitate complex coding tasks. It is
designed to work seamlessly with local project directories and provides entry scripts to bridge the gap between the
agent and external AI programming tools (like JetBrains AI Assistant or other ACP-compatible assistants).

### Key Components

- **[pi](https://pi.dev/)**: The core agent harness directory.
- **`bin/`**: Contains entry point scripts and utilities, including:
    - `pi-acp-bridge`: The primary entry point for connecting the agent to ACP-compatible environments.
    - [pi](https://pi.dev/): A wrapper around the `pi` executable.
    - [safehouse](https://agent-safehouse.dev/): A wrapper around the `safehouse` sandboxing environment used to
      execute `pi.dev` processes, ensuring they cannot run rampant across the user's machine.
- **`agent/`**: Contains core agent logic and capabilities as defined by `pi`.
- **`pi.env`**: Environment configuration for the harness.

## Integration with JetBrains / ACP

The main entry point for external agents is `pi-acp-bridge`. To use this harness with a tool like JetBrains AI
Assistant, you can configure it via an `acp.json` file.

### Example JetBrains `acp.json` Configuration

```json
{
    "default_mcp_settings": {},
    "agent_servers": {
        "pi-myrepo": {
            "command": "path/to/repo/.pi/bin/pi-acp-bridge"
        }
    }
}
```
