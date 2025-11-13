# Build Your MCP Server

## Overview

ChatGPT Apps consist of three core components: your MCP server (which defines tools and manages authentication), the widget/UI bundle (rendered in ChatGPT's iframe), and the model (which decides when to invoke tools).

### Prerequisites

- Proficiency with TypeScript or Python and a web bundler
- MCP server accessible via HTTP
- Pre-built UI bundle exporting a root script

### Typical Project Structure

```
your-chatgpt-app/
├─ server/
│  └─ src/index.ts
├─ web/
│  ├─ src/component.tsx
│  └─ dist/app.{js,css}
└─ package.json
```

## Architecture Flow

The interaction sequence flows as follows:

1. User prompt triggers ChatGPT to call an MCP tool
2. Server executes handler and returns `structuredContent`, `_meta`, and UI metadata
3. ChatGPT loads the HTML template and injects the payload via `window.openai`
4. Widget renders from `window.openai.toolOutput` and manages state with `window.openai.setWidgetState`
5. Model reads `structuredContent` to provide narration

## Understanding `window.openai` Widget Runtime

The sandboxed iframe exposes a global object with these key properties:

| Category | Property | Purpose |
|----------|----------|---------|
| State & Data | `toolInput` | Tool invocation arguments |
| State & Data | `toolOutput` | Your `structuredContent` |
| State & Data | `toolResponseMetadata` | The `_meta` payload (widget-only) |
| State & Data | `widgetState` | Persisted UI state snapshot |
| State & Data | `setWidgetState(state)` | Stores UI state synchronously |
| Widget APIs | `callTool(name, args)` | Invoke MCP tools from widget |
| Widget APIs | `sendFollowUpMessage({ prompt })` | Post message authored by component |
| Widget APIs | `requestDisplayMode` | Request PiP/fullscreen modes |
| Widget APIs | `requestModal` | Spawn ChatGPT-owned modal |
| Widget APIs | `notifyIntrinsicHeight` | Report dynamic widget heights |
| Widget APIs | `openExternal({ href })` | Open vetted external links |
| Context | `theme`, `displayMode`, `maxHeight`, `locale` | Environment signals |

## SDK Selection

The official SDKs streamline development:

- **Python SDK**: For FastMCP or FastAPI backends. Repository: [`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk)
- **TypeScript SDK**: For Node/React stacks. Repository: [`modelcontextprotocol/typescript-sdk`](https://github.com/modelcontextprotocol/typescript-sdk)

Installation:

```bash
# TypeScript / Node
npm install @modelcontextprotocol/sdk zod

# Python
pip install mcp
```

## Building Your MCP Server

### Step 1: Register a Component Template

Each UI bundle is exposed as an MCP resource with `mimeType: "text/html+skybridge"`, signaling to ChatGPT to treat it as a sandboxed HTML entry point.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";

const server = new McpServer({ name: "kanban-server", version: "1.0.0" });
const HTML = readFileSync("web/dist/kanban.js", "utf8");
const CSS = readFileSync("web/dist/kanban.css", "utf8");

server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="kanban-root"></div>
<style>${CSS}</style>
<script type="module">${HTML}</script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": "https://chatgpt.com",
          "openai/widgetCSP": {
            connect_domains: ["https://chatgpt.com"],
            resource_domains: ["https://*.oaistatic.com"],
          },
        },
      },
    ],
  })
);
```

**Best Practice**: Update template URIs when making breaking changes to ensure ChatGPT loads fresh bundles.

### Step 2: Describe Tools

Tools represent user intents. Each descriptor should specify:

- Machine-readable name and human-readable title
- JSON schema for arguments
- `_meta["openai/outputTemplate"]` pointing to template URI
- Optional metadata for invocation strings and accessibility

```typescript
import { z } from "zod";

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    inputSchema: { workspace: z.string() },
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Preparing the board…",
      "openai/toolInvocation/invoked": "Board ready.",
    },
  },
  async ({ workspace }) => {
    const board = await loadBoard(workspace);
    return {
      structuredContent: board.summary,
      content: [{ type: "text", text: `Showing board ${workspace}` }],
      _meta: board.details,
    };
  }
);
```

Design handlers to be idempotent—the model may retry calls.

### Step 3: Return Structured Data and Metadata

Every tool response includes three payloads:

- **`structuredContent`**: Concise JSON the model reads and the widget uses
- **`content`**: Optional narration (Markdown/plaintext)
- **`_meta`**: Large or sensitive data exclusively for the widget (never reaches model)

```typescript
async function loadKanbanBoard(workspace: string) {
  const tasks = await db.fetchTasks(workspace);
  return {
    structuredContent: {
      columns: ["todo", "in-progress", "done"].map((status) => ({
        id: status,
        title: status.replace("-", " "),
        tasks: tasks.filter((task) => task.status === status).slice(0, 5),
      })),
    },
    content: [
      {
        type: "text",
        text: "Here's the latest snapshot. Drag cards in the widget to update.",
      },
    ],
    _meta: {
      tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
      lastSyncedAt: new Date().toISOString(),
    },
  };
}
```

### Step 4: Run Locally

1. Build your UI bundle
2. Start the MCP server
3. Use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to verify tool calls and widget rendering

```bash
npm run build
node dist/index.js
```

### Step 5: Expose an HTTPS Endpoint

ChatGPT requires HTTPS. During development, tunnel localhost with ngrok:

```bash
ngrok http <port>
```

For production, deploy to a low-latency HTTPS host (Cloudflare Workers, Fly.io, Vercel, AWS, etc.).

## Minimal Example

```typescript
// server/src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const server = new McpServer({ name: "hello-world", version: "1.0.0" });

server.registerResource("hello", "ui://widget/hello.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/hello.html",
      mimeType: "text/html+skybridge",
      text: `
<div id="root"></div>
<script type="module" src="https://example.com/hello-widget.js"></script>
      `.trim(),
    },
  ],
}));

server.registerTool(
  "hello_widget",
  {
    title: "Show hello widget",
    inputSchema: { name: { type: "string" } },
    _meta: { "openai/outputTemplate": "ui://widget/hello.html" },
  },
  async ({ name }) => ({
    structuredContent: { message: `Hello ${name}!` },
    content: [{ type: "text", text: `Greeting ${name}` }],
    _meta: {},
  })
);
```

```javascript
// hello-widget.js
const root = document.getElementById("root");
const { message } = window.openai.toolOutput ?? { message: "Hi!" };
root.textContent = message;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget doesn't render | Verify `mimeType: "text/html+skybridge"` and bundled URLs resolve in sandbox |
| `window.openai` undefined | Confirm MIME type and check for CSP violations |
| CSP/CORS failures | Use `openai/widgetCSP` to allowlist required domains |
| Stale bundles load | Cache-bust template URIs when deploying breaking changes |
| Large structured payloads | Trim `structuredContent` to what the model needs |

## Advanced Capabilities

### Component-Initiated Tool Calls

Enable `_meta.openai/widgetAccessible: true` to allow widgets to call tools independently:

```json
{
  "_meta": {
    "openai/outputTemplate": "ui://widget/kanban-board.html",
    "openai/widgetAccessible": true
  }
}
```

### Content Security Policy

Specify allowed domains for the widget sandbox:

```json
{
  "openai/widgetCSP": {
    "connect_domains": ["https://api.example.com"],
    "resource_domains": ["https://persistent.oaistatic.com"]
  }
}
```

### Widget Domains

Dedicate an origin for API key allowlists:

```json
{
  "openai/widgetDomain": "https://chatgpt.com"
}
```

### Localized Content

ChatGPT provides locale in `_meta["openai/locale"]`. Use RFC 4647 matching to select appropriate translations and formats.

### Component Descriptions

Reduce redundant narration with `openai/widgetDescription`:

```json
{
  "openai/widgetDescription": "Displays an interactive zoo directory"
}
```

## Security Reminders

- Never embed API keys, tokens, or secrets in `structuredContent`, `content`, `_meta`, or widget state
- Don't rely on `_meta` hints for authorization; enforce auth within the MCP server
- Avoid exposing admin-only or destructive tools without identity verification
- Test widget thoroughly with MCP Inspector before deployment

---

**Next**: [Build a Custom UX](/apps-sdk/build/custom-ux)