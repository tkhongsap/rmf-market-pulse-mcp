# Managing State

## Overview

This guide addresses how to manage state in ChatGPT applications built using the Apps SDK and an MCP server. The documentation identifies three distinct categories:

| State Type | Owner | Duration | Use Cases |
|---|---|---|---|
| Business data | MCP server or backend | Long-lived | Tasks, tickets, documents |
| UI state | Widget instance | Active widget only | Selected rows, panels, sort order |
| Cross-session state | Backend storage | Persistent | Filters, view modes, workspace selection |

The key principle: "Place every piece of state where it belongs so the UI stays consistent and the chat matches the expected intent."

## Widget Architecture in ChatGPT

Custom UI components render within message-scoped widgets. Understanding their lifecycle matters:

- **Fresh instances**: Each response creates a new widget instance with its own UI state
- **State persistence**: Reopening a message restores previously saved widget state
- **Data authority**: Business data updates only arrive when tool calls complete

The conceptual model shows that authoritative data flows from the server through the widget, where ephemeral UI state layers on top for rendering.

## Business State (Authoritative)

Business data represents the source of truth and should reside on your MCP server or backend service. When users interact:

1. UI invokes a server tool
2. Server modifies data
3. Server returns updated snapshot
4. Widget re-renders with new data

This architecture prevents divergence between UI and backend state.

### Server Example (Node.js)

```javascript
import { Server } from "@modelcontextprotocol/sdk/server";
import { jsonSchema } from "@modelcontextprotocol/sdk/schema";

const tasks = new Map();
let nextId = 1;

const server = new Server({
  tools: {
    get_tasks: {
      description: "Return all tasks",
      inputSchema: jsonSchema.object({}),
      async run() {
        return {
          structuredContent: {
            type: "taskList",
            tasks: Array.from(tasks.values()),
          }
        };
      }
    },
    add_task: {
      description: "Add a new task",
      inputSchema: jsonSchema.object({ title: jsonSchema.string() }),
      async run({ title }) {
        const id = `task-${nextId++}`;
        tasks.set(id, { id, title, done: false });
        return this.tools.get_tasks.run({});
      }
    }
  }
});

server.start();
```

## UI State (Ephemeral)

UI state describes presentation layer concerns—how data appears—rather than the data itself. Widgets maintain UI state independently using:

- `window.openai.widgetState`: Read current state snapshot
- `window.openai.setWidgetState(newState)`: Write next snapshot (synchronous call)

React developers should leverage the `useWidgetState` hook, which:

- Initializes from `window.openai.widgetState` or a provided initializer
- Subscribes to future updates automatically
- Syncs writes back through `window.openai.setWidgetState`

The operation is non-blocking; persistence occurs asynchronously.

### React Example

```jsx
import { useWidgetState } from "./use-widget-state";

export function TaskList({ data }) {
  const [widgetState, setWidgetState] = useWidgetState(() => ({
    selectedId: null,
  }));

  const selectTask = (id) => {
    setWidgetState((prev) => ({ ...prev, selectedId: id }));
  };

  return (
    <ul>
      {data.tasks.map((task) => (
        <li
          key={task.id}
          style={{
            fontWeight: widgetState?.selectedId === task.id ? "bold" : "normal",
          }}
          onClick={() => selectTask(task.id)}
        >
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

### Vanilla JavaScript Example

```javascript
const tasks = window.openai.toolOutput?.tasks ?? [];
let widgetState = window.openai.widgetState ?? { selectedId: null };

function selectTask(id) {
  widgetState = { ...widgetState, selectedId: id };
  window.openai.setWidgetState(widgetState);
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.innerHTML = tasks
    .map(
      (task) => `
        <li
          style="font-weight: ${widgetState.selectedId === task.id ? "bold" : "normal"}"
          onclick="selectTask('${task.id}')"
        >
          ${task.title}
        </li>
      `
    )
    .join("");
}

renderTasks();
```

## Cross-Session State

Preferences, settings, and data requiring persistence across conversations should live in your backend storage system. While the Apps SDK manages conversation context automatically, production applications typically require a durable storage layer for:

- User preferences
- Cached data
- Artifacts created within components
- Multi-device synchronization

### Bring Your Own Backend

Integration with existing infrastructure:

- Authenticate users via OAuth to map ChatGPT identities to internal accounts
- Call backend APIs to fetch and mutate data, maintaining low latency
- Return sufficient structured content for model comprehension even if components fail

Plan for:

- **Data residency**: Ensure compliance agreements exist before transferring sensitive information
- **Rate limits**: Protect APIs against traffic spikes from retries
- **Versioning**: Include schema versions in objects for seamless migration

### Widget Invoking a Tool (React)

```jsx
import { useState } from "react";

export function PreferencesForm({ userId, initialPreferences }) {
  const [formState, setFormState] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreferences(next) {
    setIsSaving(true);
    setFormState(next);
    window.openai.setWidgetState(next);

    const result = await window.openai.callTool("set_preferences", {
      userId,
      preferences: next,
    });

    const updated = result?.structuredContent?.preferences ?? next;
    setFormState(updated);
    window.openai.setWidgetState(updated);
    setIsSaving(false);
  }

  return (
    <form>
      <button type="button" disabled={isSaving} onClick={() => savePreferences(formState)}>
        {isSaving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
```

### Server Implementation (Node.js)

```javascript
import { Server } from "@modelcontextprotocol/sdk/server";
import { jsonSchema } from "@modelcontextprotocol/sdk/schema";
import { request } from "undici";

async function readPreferences(userId) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
  });
  if (response.statusCode === 404) return {};
  if (response.statusCode >= 400) throw new Error("Failed to load preferences");
  return await response.body.json();
}

async function writePreferences(userId, preferences) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preferences)
  });
  if (response.statusCode >= 400) throw new Error("Failed to save preferences");
  return await response.body.json();
}

const server = new Server({
  tools: {
    get_preferences: {
      inputSchema: jsonSchema.object({ userId: jsonSchema.string() }),
      async run({ userId }) {
        const preferences = await readPreferences(userId);
        return { structuredContent: { type: "preferences", preferences } };
      }
    },
    set_preferences: {
      inputSchema: jsonSchema.object({
        userId: jsonSchema.string(),
        preferences: jsonSchema.object({})
      }),
      async run({ userId, preferences }) {
        const updated = await writePreferences(userId, preferences);
        return { structuredContent: { type: "preferences", preferences: updated } };
      }
    }
  }
});
```

## Summary

- **Business data**: Store on server
- **UI state**: Store in widget via `window.openai` APIs or `useWidgetState` hook
- **Cross-session state**: Maintain in your controlled backend
- **Widget persistence**: Limited to the message instance lifecycle
- **Avoid `localStorage`** for critical state

---

**Navigation**
- [Previous: Authenticate users](/apps-sdk/build/auth)
- [Next: Examples](/apps-sdk/build/examples)
