# Build Your MCP Server

## Core Overview

ChatGPT Apps consist of three integrated components: an MCP server that manages tools and authentication, a widget UI bundle rendered in ChatGPT's iframe, and the AI model that decides when to invoke tools. The server acts as the backbone, defining what operations are available while keeping data and presentation layers separate.

## Key Architecture Concepts

The workflow follows this sequence: user input → ChatGPT model evaluation → MCP tool invocation → server processes request → response returned with structured data → widget renders in sandbox using `window.openai` globals → model narrates using the data payload.

### The Widget Runtime (`window.openai`)

The sandboxed iframe exposes critical properties including `toolOutput` (your structured response data), `toolInput` (invocation arguments), `toolResponseMetadata` (widget-only sensitive information), and `widgetState` for UI persistence. Additionally, callable methods like `callTool()`, `setWidgetState()`, `sendFollowUpMessage()`, and `requestModal()` enable rich interactivity.

## Implementation Steps

**Step 1 – Register Templates:**
Resources marked with `"text/html+skybridge"` MIME type signal to ChatGPT that the content should render as a sandboxed widget. Each template requires metadata including CSP rules and domain allowlists.

**Step 2 – Define Tools:**
Tools represent distinct user intents with JSON schemas, descriptive metadata, and idempotent handlers. The model reads tool descriptions to determine relevance, making names and schemas critical to user experience.

**Step 3 – Structure Responses:**
Every tool response includes three distinct payloads: `structuredContent` (model-visible summary), `content` (narration text), and `_meta` (widget-exclusive rich data). This separation ensures the model sees concise information while widgets access complete context.

**Step 4 – Local Testing:**
Build your UI bundle, start the MCP server, and validate using MCP Inspector before exposing via HTTPS with tunneling services like ngrok.

**Step 5 – Deploy HTTPS Endpoint:**
ChatGPT requires HTTPS connectivity; production deployment should use services like Cloudflare Workers, Fly.io, or AWS.

## Response Payload Example

```typescript
{
  structuredContent: { columns: [...], summary: "..." },
  content: [{ type: "text", text: "Narration for model" }],
  _meta: { tasksById: {...}, internal: "..." }
}
```

## Security Essentials

Never embed credentials in any visible payload. Authorization must occur server-side; hints like `userAgent` and `locale` should never gate sensitive operations. Widget state and structured content remain user-visible; treat them accordingly.

## Advanced Features

- **Component-initiated calls:** Set `widgetAccessible: true` to allow widgets calling tools independently
- **CSP policies:** Restrict resource domains explicitly via `openai/widgetCSP`
- **Localization:** ChatGPT provides locale hints for content adaptation
- **Modal support:** Use `requestModal()` for checkout flows or detail views without forcing widget resizing

---

**Source URL:** https://developers.openai.com/apps-sdk/build/mcp-server
**Extracted:** 2025-11-14
