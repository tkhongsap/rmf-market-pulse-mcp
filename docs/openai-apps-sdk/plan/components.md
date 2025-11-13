# Design Components

## Overview

UI components represent the visible interface layer of your connector, allowing users to interact with data inline, expand to fullscreen when necessary, and maintain context synchronization between chat prompts and UI interactions. Early component planning ensures your MCP server delivers appropriately structured data and metadata.

## Why Components Matter

"UI components are the human-visible half of your connector." They enable users to view or edit data within the chat interface, switch to expanded views as needed, and keep information synchronized across different interaction modes. Planning components early ensures your backend returns properly formatted structured data from the start.

## Sample Components

The SDK provides reusable examples demonstrating common patterns:

- **List** – Dynamic collections with empty-state handling
- **Map** – Geographical data with marker clustering and detail panels
- **Album** – Media grids with fullscreen capabilities
- **Carousel** – Featured content with gesture support
- **Shop** – Product browsing with transaction workflows

Examples are available in the [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) repository.

## Key Design Decisions

### User Interaction Model
Define whether components are read-only displays or interactive editors, whether users complete tasks in one session or iterate across multiple turns, and whether inline or fullscreen presentation suits your use case.

### Data Requirements
"Components should receive everything they need in the tool response." Specify JSON payloads, initial state via `window.openai.toolOutput`, and authentication context requirements upfront.

### Responsive Design
Plan adaptive layouts for desktop and mobile, respect system dark mode preferences, ensure keyboard navigation support, and document design tokens consistently.

### State Management
Clarify what lives in component state (selected records, form data), server state (authoritative data), and model messages (human-readable transcripts).

### Observability
Plan analytics events, logging strategies linking tool calls to telemetry, and fallback UI for component failures.