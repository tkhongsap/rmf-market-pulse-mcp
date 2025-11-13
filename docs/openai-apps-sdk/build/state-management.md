# Managing State in ChatGPT Apps

## Overview

State in ChatGPT apps falls into three distinct categories:

| State Type | Owned By | Lifetime | Examples |
|---|---|---|---|
| Business data (authoritative) | MCP server or backend service | Long-lived | Tasks, tickets, documents |
| UI state (ephemeral) | Widget instance inside ChatGPT | Active widget only | Selected row, expanded panel, sort order |
| Cross-session state (durable) | Backend or storage | Cross-session and cross-conversation | Saved filters, view mode, workspace selection |

## How Widgets Work in ChatGPT

When an app returns a custom UI component, ChatGPT renders it within a message-scoped widget. This widget persists as long as that message exists in the thread.

**Key behaviors:**
- Widgets are tied to individual messages
- UI state persists when reopening the same message
- "The widget only sees updated business data when a tool call completes, and then it reapplies its local UI state"

## 1. Business State (Authoritative)

Business data represents the source of truth and should live on the MCP server or backend, not within the widget. When users take action:

1. UI calls a server tool
2. Server updates data
3. Server returns the new authoritative snapshot
4. Widget re-renders using that snapshot

This architecture prevents divergence between UI and server states.

## 2. UI State (Ephemeral)

UI state describes how data is viewed, not the data itself. Manage it using:

- `window.openai.widgetState` – read current state snapshot
- `window.openai.setWidgetState()` – write state synchronously
- `useWidgetState` hook (React apps)

The hook automatically hydrates initial state and subscribes to future updates. State persists only for the widget instance belonging to a specific message.

## 3. Cross-Session State

Preferences persisting across conversations should be stored in your backend. Consider:

- **Data residency and compliance** – establish agreements before transferring PII
- **Rate limits** – protect APIs against traffic spikes
- **Versioning** – include schema versions for migrations

## Key Principles

- Store authoritative data on servers
- Manage UI state within widgets using provided APIs
- Use backend storage for durable, cross-session data
- Avoid relying on `localStorage` for core state