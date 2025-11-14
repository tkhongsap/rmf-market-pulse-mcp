# Manage State

## Overview

State in ChatGPT applications falls into three primary categories:

| State Type | Owner | Lifetime | Examples |
|---|---|---|---|
| Business data (authoritative) | MCP server or backend service | Long-lived | Tasks, tickets, documents |
| UI state (ephemeral) | Widget instance in ChatGPT | Active widget only | Selected row, expanded panel, sort order |
| Cross-session state (durable) | Backend or storage | Cross-session and cross-conversation | Saved filters, view mode, workspace selection |

## Widget Architecture

Custom UI components render within message-scoped widgets. Key behaviors include:

- Each response creates a fresh widget instance with independent UI state
- Reopening the same message restores saved state
- Business data updates only occur after tool completion
- The widget reapplies local UI state to the new data snapshot

## Business State (Authoritative)

Business data represents the source of truth and should reside on the MCP server or backend—never within the widget itself.

**Process flow:**
1. UI invokes a server tool
2. Server modifies data
3. Server returns the updated authoritative snapshot
4. Widget re-renders using that snapshot

This architecture prevents UI-server divergence.

## UI State (Ephemeral)

UI state describes "how" data displays, not the data itself. Widgets maintain UI state independently using:

- `window.openai.widgetState` – reads current widget-scoped state
- `window.openai.setWidgetState(newState)` – writes new state snapshot

React applications should utilize the `useWidgetState` hook for automatic hydration and subscription management.

## Cross-session State

Preferences persisting across conversations require backend storage. Implementation considerations:

- Authenticate via OAuth to map ChatGPT identities to internal accounts
- Keep API latency minimal for responsive component rendering
- Plan for data residency compliance before transferring sensitive information
- Implement rate limiting and schema versioning

## Key Principles

"Store business data on the server. Store UI state inside the widget using window.openai.widgetState, window.openai.setWidgetState, or the useWidgetState hook. Store cross-session state in backend storage you control."

Widget state persists only for the widget instance associated with a specific message. Avoid using localStorage for core application state.

---

**Source URL:** https://developers.openai.com/apps-sdk/build/state-management
**Extracted:** 2025-11-14
